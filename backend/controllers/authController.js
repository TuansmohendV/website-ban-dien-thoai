import crypto from 'crypto';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { sendResetOtpEmail } from '../utils/email.js';
import { normalizePhone } from '../utils/phone.js';
import { signToken } from '../utils/token.js';

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;
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
  token: signToken(userDoc._id),
  user: sanitizeUser(userDoc),
});

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
  }).select('+password');

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

  const otpCode = `${Math.floor(100000 + Math.random() * 900000)}`;
  const hashedToken = crypto.createHash('sha256').update(otpCode).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  if (user.email) {
    await sendResetOtpEmail({
      to: user.email,
      otpCode,
      expiresAt: user.resetPasswordExpiresAt,
    });
  }

  res.json({
    message:
      'Neu tai khoan ton tai, he thong da gui ma OTP khoi phuc mat khau den email dang ky.',
    expiresAt: user.resetPasswordExpiresAt,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword || newPassword.length < 6) {
    throw new AppError(400, 'Token và mật khẩu mới phải hợp lệ.');
  }

  const normalizedToken = String(token).trim();
  const hashedToken = crypto
    .createHash('sha256')
    .update(normalizedToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiresAt: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpiresAt');

  if (!user) {
    throw new AppError(400, 'Token reset mật khẩu không hợp lệ hoặc đã hết hạn.');
  }

  user.password = newPassword;
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

  const user = await User.findById(req.user._id).select('+password');

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError(401, 'Mật khẩu hiện tại không chính xác.');
  }

  user.password = newPassword;
  await user.save();

  res.json({
    message: 'Đổi mật khẩu thành công.',
  });
});

export const socialLogin = asyncHandler(async (req, res) => {
  const { provider, idToken, accessToken } = req.body;

  if (!provider || !['google', 'facebook'].includes(provider)) {
    throw new AppError(400, 'Provider phải là google hoặc facebook.');
  }

  if (!idToken && !accessToken) {
    throw new AppError(400, 'Vui lòng cung cấp idToken hoặc accessToken.');
  }

  // In development/test mode, simulate social login
  // In production, verify tokens with Google/Facebook APIs
  let email = '';
  let fullName = 'Social User';
  let avatar = '';

  if (process.env.NODE_ENV === 'production') {
    throw new AppError(501, 'Social login chưa được tích hợp OAuth provider thực tế.');
  }

  // Simulate: create or find user based on provider token
  email = `social.${provider}.${Date.now()}@example.com`;
  fullName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      fullName,
      email,
      password: crypto.randomBytes(16).toString('hex'),
      avatar,
      authProvider: provider,
    });
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({
    ...buildAuthResponse(user),
    message: `Đăng nhập bằng ${provider} thành công.`,
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  // JWT is stateless, so logout is handled on the client side
  // This endpoint confirms the logout action
  res.json({
    message: 'Đăng xuất thành công.',
  });
});
