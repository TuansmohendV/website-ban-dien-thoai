import crypto from 'crypto';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { normalizePhone } from '../utils/phone.js';
import { signToken } from '../utils/token.js';

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;
  delete user.tokenVersion;
  delete user.googleId;
  delete user.facebookId;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpiresAt;
  return user;
};

const buildUserLookup = ({ email, phone, identifier }) => {
  const conditions = [];

  if (email) {
    conditions.push({ email: email.toLowerCase().trim() });
  }

  if (phone) {
    conditions.push({ phone: normalizePhone(phone) });
  }

  if (identifier) {
    const normalizedIdentifier = String(identifier).trim();
    conditions.push({ email: normalizedIdentifier.toLowerCase() });
    conditions.push({ phone: normalizePhone(normalizedIdentifier) });
  }

  return conditions;
};

const buildAuthResponse = (userDoc) => ({
  message: 'Xử lý xác thực thành công.',
  token: signToken(userDoc._id, userDoc.tokenVersion || 0),
  user: sanitizeUser(userDoc),
});

const rotateUserTokenVersion = async (userDoc, saveOptions = {}) => {
  userDoc.tokenVersion = (userDoc.tokenVersion || 0) + 1;
  await userDoc.save(saveOptions);
  return userDoc;
};

const socialProviderConfig = {
  google: {
    idField: 'googleId',
    authProvider: 'google',
  },
  facebook: {
    idField: 'facebookId',
    authProvider: 'facebook',
  },
};

const createRandomSocialPassword = () => crypto.randomBytes(24).toString('hex');

const verifyGoogleUser = async ({ idToken, accessToken }) => {
  const targetUrl = idToken
    ? `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    : `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(accessToken)}`;

  const response = await fetch(targetUrl);
  const payload = await response.json();

  if (!response.ok) {
    throw new AppError(401, 'Token Google không hợp lệ hoặc đã hết hạn.');
  }

  return {
    providerId: payload.sub,
    fullName: payload.name || payload.given_name || 'Google User',
    email: payload.email ? String(payload.email).toLowerCase().trim() : '',
    avatar: payload.picture || '',
  };
};

const verifyFacebookUser = async ({ accessToken }) => {
  const response = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`
  );
  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new AppError(401, 'Token Facebook không hợp lệ hoặc đã hết hạn.');
  }

  return {
    providerId: payload.id,
    fullName: payload.name || 'Facebook User',
    email: payload.email ? String(payload.email).toLowerCase().trim() : '',
    avatar: payload.picture?.data?.url || '',
  };
};

const resolveSocialProfile = async ({ provider, idToken, accessToken }) => {
  if (provider === 'google') {
    if (!idToken && !accessToken) {
      throw new AppError(400, 'Google login cần idToken hoặc accessToken.');
    }

    return verifyGoogleUser({ idToken, accessToken });
  }

  if (provider === 'facebook') {
    if (!accessToken) {
      throw new AppError(400, 'Facebook login cần accessToken.');
    }

    return verifyFacebookUser({ accessToken });
  }

  throw new AppError(400, 'Provider social login chỉ chấp nhận google hoặc facebook.');
};

const resolveSocialUser = async ({ provider, profile }) => {
  const providerConfig = socialProviderConfig[provider];

  if (!providerConfig?.idField || !profile?.providerId) {
    throw new AppError(400, 'Không thể xác định thông tin tài khoản social login.');
  }

  let user = await User.findOne({
    [providerConfig.idField]: profile.providerId,
  }).select('+tokenVersion');

  if (!user && profile.email) {
    user = await User.findOne({
      email: profile.email,
    }).select('+tokenVersion');
  }

  if (!user) {
    user = await User.create({
      fullName: profile.fullName,
      email: profile.email || undefined,
      avatar: profile.avatar || '',
      authProvider: providerConfig.authProvider,
      [providerConfig.idField]: profile.providerId,
      password: createRandomSocialPassword(),
    });

    return user;
  }

  user.fullName = profile.fullName || user.fullName;
  user.avatar = profile.avatar || user.avatar;
  user.authProvider = providerConfig.authProvider;
  user[providerConfig.idField] = profile.providerId;
  user.lastLoginAt = new Date();

  await user.save({ validateBeforeSave: false });

  return user;
};

export const registerUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    email: rawEmail,
    phone: rawPhone,
    password,
    avatar,
    gender,
    dateOfBirth,
  } = req.body;

  const email = rawEmail ? rawEmail.toLowerCase().trim() : '';
  const phone = rawPhone ? normalizePhone(rawPhone) : '';

  if (!email && !phone) {
    throw new AppError(400, 'Vui lòng cung cấp email hoặc số điện thoại.');
  }

  if (!password || password.length < 6) {
    throw new AppError(400, 'Mật khẩu phải có ít nhất 6 ký tự.');
  }

  const existingUser = await User.findOne({
    $or: buildUserLookup({ email, phone }),
  });

  if (existingUser) {
    throw new AppError(409, 'Email hoặc số điện thoại đã được sử dụng.');
  }

  const user = await User.create({
    fullName: fullName?.trim() || 'Khach hang',
    email: email || undefined,
    phone: phone || undefined,
    password,
    avatar: avatar || '',
    gender: gender || 'other',
    dateOfBirth: dateOfBirth || undefined,
  });

  res.status(201).json({
    ...buildAuthResponse(user),
    message: 'Đăng ký tài khoản thành công.',
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, identifier, password } = req.body;

  if ((!email && !phone && !identifier) || !password) {
    throw new AppError(400, 'Vui lòng nhập tài khoản và mật khẩu.');
  }

  const user = await User.findOne({
    $or: buildUserLookup({ email, phone, identifier }),
  }).select('+password +tokenVersion');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, 'Tài khoản hoặc mật khẩu không đúng.');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({
    ...buildAuthResponse(user),
    message: 'Đăng nhập thành công.',
  });
});

export const socialLogin = asyncHandler(async (req, res) => {
  const provider = String(req.body.provider || '')
    .trim()
    .toLowerCase();
  const profile = await resolveSocialProfile({
    provider,
    idToken: req.body.idToken,
    accessToken: req.body.accessToken,
  });
  const user = await resolveSocialUser({ provider, profile });

  res.json({
    ...buildAuthResponse(user),
    message: `Đăng nhập ${provider} thành công.`,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email, phone, identifier } = req.body;
  const userLookup = buildUserLookup({ email, phone, identifier });

  if (!userLookup.length) {
    throw new AppError(400, 'Vui lòng cung cấp email hoặc số điện thoại.');
  }

  const user = await User.findOne({ $or: userLookup }).select(
    '+resetPasswordToken +resetPasswordExpiresAt'
  );

  if (!user) {
    return res.json({
      message:
        'Nếu tài khoản tồn tại, hệ thống đã tạo yêu cầu đặt lại mật khẩu.',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  res.json({
    message:
      'Đã tạo yêu cầu reset mật khẩu. Hãy dùng token này để test frontend/backend nội bộ.',
    resetToken: process.env.NODE_ENV === 'production' ? undefined : resetToken,
    expiresAt: user.resetPasswordExpiresAt,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword || newPassword.length < 6) {
    throw new AppError(400, 'Token và mật khẩu mới phải hợp lệ.');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiresAt: { $gt: new Date() },
  }).select('+password +tokenVersion +resetPasswordToken +resetPasswordExpiresAt');

  if (!user) {
    throw new AppError(400, 'Token reset mật khẩu không hợp lệ hoặc đã hết hạn.');
  }

  user.password = newPassword;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  res.json({
    ...buildAuthResponse(user),
    message: 'Đặt lại mật khẩu thành công.',
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    throw new AppError(400, 'Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới.');
  }

  const user = await User.findById(req.user._id).select(
    '+password +tokenVersion'
  );

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError(401, 'Mật khẩu hiện tại không chính xác.');
  }

  user.password = newPassword;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  res.json({
    message: 'Đổi mật khẩu thành công.',
    token: signToken(user._id, user.tokenVersion || 0),
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  await rotateUserTokenVersion(req.user, { validateBeforeSave: false });

  res.json({
    message: 'Đăng xuất thành công.',
  });
});
