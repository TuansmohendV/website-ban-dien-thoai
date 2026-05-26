import User from '../models/User.js';
import Order from '../models/Order.js';
import Wishlist from '../models/Wishlist.js';
import Review from '../models/Review.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { normalizePhone } from '../utils/phone.js';
import { sendEmail } from '../services/emailService.js';
import Voucher from '../models/Voucher.js';

export const getUserProfile = asyncHandler(async (req, res) => {
  res.json({
    user: req.user,
  });
});

export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [orderStats] = await Order.aggregate([
    { $match: { user: userId, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$total' },
      },
    },
  ]);

  const wishlistCount = await Wishlist.countDocuments({ userId: userId });
  const reviewCount = await Review.countDocuments({ user: userId });

  res.json({
    totalOrders: orderStats?.totalOrders || 0,
    totalSpent: orderStats?.totalSpent || 0,
    wishlistCount,
    reviewCount,
  });
});

export const getAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isDeleted: { $ne: true } })
    .select('-password -resetPasswordToken -resetPasswordExpiresAt')
    .sort({ createdAt: -1 })
    .lean();

  const stats = await Order.aggregate([
    { $match: { user: { $ne: null } } },
    {
      $group: {
        _id: '$user',
        totalOrders: { $sum: 1 },
        spent: { $sum: '$total' },
      },
    },
  ]);

  const statsByUser = new Map(stats.map((item) => [String(item._id), item]));

  res.json({
    data: users.map((user) => ({
      ...user,
      totalOrders: statsByUser.get(String(user._id))?.totalOrders || 0,
      spent: statsByUser.get(String(user._id))?.spent || 0,
      isVIP: (statsByUser.get(String(user._id))?.spent || 0) >= 20000000 || (statsByUser.get(String(user._id))?.totalOrders || 0) >= 2,
    })),
  });
});

export const createAdminCustomer = asyncHandler(async (req, res) => {
  const fullName = req.body.fullName?.trim() || 'Khach hang';
  const email = req.body.email ? String(req.body.email).toLowerCase().trim() : '';
  const phone = req.body.phone ? normalizePhone(req.body.phone) : '';
  const password = req.body.password;

  if (!email && !phone) {
    throw new AppError(400, 'Vui lòng nhập email hoặc số điện thoại.');
  }

  if (!password || password.length < 6) {
    throw new AppError(400, 'Mật khẩu phải có ít nhất 6 ký tự.');
  }

  const duplicateFilters = [];
  if (email) duplicateFilters.push({ email });
  if (phone) duplicateFilters.push({ phone });

  const existingUser = await User.findOne({ $or: duplicateFilters });
  if (existingUser) {
    throw new AppError(409, 'Email hoặc số điện thoại đã được sử dụng.');
  }

  const user = await User.create({
    fullName,
    email: email || undefined,
    phone: phone || undefined,
    password,
    role: 'customer',
    isActive: req.body.isActive !== false,
  });

  const createdUser = user.toObject();
  delete createdUser.password;

  res.status(201).json({
    message: 'Tạo khách hàng thành công.',
    user: {
      ...createdUser,
      totalOrders: 0,
      spent: 0,
    },
  });
});

export const createAdminUser = asyncHandler(async (req, res) => {
  const fullName = req.body.fullName?.trim() || 'Khach hang';
  const email = req.body.email ? String(req.body.email).toLowerCase().trim() : '';
  const phone = req.body.phone ? normalizePhone(req.body.phone) : '';
  const password = req.body.password;
  const role = req.body.role || 'customer';

  if (!email && !phone) {
    throw new AppError(400, 'Vui lòng nhập email hoặc số điện thoại.');
  }

  if (!password || password.length < 6) {
    throw new AppError(400, 'Mật khẩu phải có ít nhất 6 ký tự.');
  }

  const duplicateFilters = [];
  if (email) duplicateFilters.push({ email });
  if (phone) duplicateFilters.push({ phone });

  const existingUser = await User.findOne({ $or: duplicateFilters });
  if (existingUser) {
    throw new AppError(409, 'Email hoặc số điện thoại đã được sử dụng.');
  }

  const user = await User.create({
    fullName,
    email: email || undefined,
    phone: phone || undefined,
    password,
    avatar: req.body.avatar || '',
    gender: req.body.gender || 'other',
    dateOfBirth: req.body.dateOfBirth || undefined,
    role,
    isActive: req.body.isActive !== false,
  });

  const createdUser = user.toObject();
  delete createdUser.password;

  res.status(201).json({
    message: 'Tạo người dùng thành công.',
    user: {
      ...createdUser,
      totalOrders: 0,
      spent: 0,
    },
  });
});

export const getAdminUserDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -resetPasswordToken -resetPasswordExpiresAt')
    .lean();

  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng.');
  }

  const [stats] = await Order.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        spent: { $sum: '$total' },
      },
    },
  ]);

  res.json({
    user: {
      ...user,
      totalOrders: stats?.totalOrders || 0,
      spent: stats?.spent || 0,
      isVIP: (stats?.spent || 0) >= 20000000 || (stats?.totalOrders || 0) >= 2,
    },
  });
});

export const updateAdminUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role) {
    throw new AppError(400, 'Vui lòng chọn role mới.');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng.');
  }

  if (String(req.params.id) === String(req.user._id)) {
    throw new AppError(400, 'Không thể đổi role chính mình.');
  }

  user.role = role;
  await user.save({ validateBeforeSave: false });

  const updatedUser = user.toObject();
  delete updatedUser.password;

  res.json({
    message: 'Cập nhật role thành công.',
    user: updatedUser,
  });
});

const applyUniqueContactUpdates = async (user, { email, phone }) => {
  const nextEmail = email !== undefined ? String(email).toLowerCase().trim() : user.email;
  const nextPhone = phone !== undefined && phone !== '' ? normalizePhone(phone) : user.phone;

  if (nextEmail && nextEmail !== user.email) {
    const emailOwner = await User.findOne({
      email: nextEmail,
      _id: { $ne: user._id },
    });

    if (emailOwner) {
      throw new AppError(409, 'Email đã được dùng bởi tài khoản khác.');
    }
  }

  if (nextPhone && nextPhone !== user.phone) {
    const phoneOwner = await User.findOne({
      phone: nextPhone,
      _id: { $ne: user._id },
    });

    if (phoneOwner) {
      throw new AppError(409, 'Số điện thoại đã được dùng bởi tài khoản khác.');
    }
  }

  user.email = nextEmail || undefined;
  user.phone = nextPhone || undefined;
};

export const updateAdminUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng.');
  }

  await applyUniqueContactUpdates(user, {
    email: req.body.email,
    phone: req.body.phone,
  });

  user.fullName = req.body.fullName?.trim() || user.fullName;

  if (req.body.isActive !== undefined) {
    user.isActive = Boolean(req.body.isActive);
  }

  await user.save();

  const updatedUser = user.toObject();
  delete updatedUser.password;

  res.json({
    message: 'Cập nhật người dùng thành công.',
    user: updatedUser,
  });
});

export const updateAdminUserPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    throw new AppError(400, 'Mật khẩu phải có ít nhất 6 ký tự.');
  }

  const user = await User.findById(req.params.id).select('+password');

  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng.');
  }

  user.password = password;
  await user.save();

  res.json({
    message: 'Cập nhật mật khẩu thành công.',
  });
});

export const deleteAdminUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw new AppError(400, 'Không thể xóa tài khoản đang đăng nhập.');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng.');
  }

  user.isActive = false;
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  res.json({
    message: 'Chuyển người dùng vào trạng thái đã khóa (xoá mềm) thành công.',
  });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng.');
  }

  const nextEmail = req.body.email
    ? String(req.body.email).toLowerCase().trim()
    : user.email;
  const nextPhone = req.body.phone ? normalizePhone(req.body.phone) : user.phone;

  if (nextEmail && nextEmail !== user.email) {
    const emailOwner = await User.findOne({
      email: nextEmail,
      _id: { $ne: user._id },
    });

    if (emailOwner) {
      throw new AppError(409, 'Email đã được dùng bởi tài khoản khác.');
    }
  }

  if (nextPhone && nextPhone !== user.phone) {
    const phoneOwner = await User.findOne({
      phone: nextPhone,
      _id: { $ne: user._id },
    });

    if (phoneOwner) {
      throw new AppError(409, 'Số điện thoại đã được dùng bởi tài khoản khác.');
    }
  }

  user.fullName = req.body.fullName?.trim() || user.fullName;
  user.email = nextEmail || undefined;
  user.phone = nextPhone || undefined;
  user.avatar = req.body.avatar ?? user.avatar;
  user.gender = req.body.gender || user.gender;
  user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;

  // New address fields for Checkout Persistence
  user.province = req.body.province !== undefined ? req.body.province : user.province;
  user.district = req.body.district !== undefined ? req.body.district : user.district;
  user.ward = req.body.ward !== undefined ? req.body.ward : user.ward;
  user.address = req.body.address !== undefined ? req.body.address : user.address;

  await user.save();

  res.json({
    message: 'Cập nhật hồ sơ thành công.',
    user,
  });
});

export const sendPromotionalEmail = asyncHandler(async (req, res) => {
  const { userId, subject, content } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng.');
  }

  if (!user.email) {
    throw new AppError(400, 'Người dùng này chưa cập nhật email.');
  }

  const defaultHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #2563eb; margin: 0; font-size: 28px;">PhoneSin Mobile</h2>
        <p style="color: #666; margin: 8px 0 0 0;">Ưu đãi đặc biệt dành cho bạn</p>
      </div>
      <p>Chào <b>${user.fullName}</b>,</p>
      <div style="color: #333; line-height: 1.6;">
        ${content || 'Chúng tôi có một ưu đãi đặc biệt dành cho bạn. Hãy ghé thăm cửa hàng ngay hôm nay để nhận những phần quà hấp dẫn!'}
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Ghé thăm cửa hàng</a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; color: #aaa; text-align: center;">© PhoneSin Mobile - Email gửi tới ${user.email}</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: subject || 'Ưu đãi đặc biệt từ PhoneSin Mobile',
    html: defaultHtml,
  });

  res.json({
    message: `Đã gửi email ưu đãi tới ${user.email} thành công.`,
  });
});

export const linkAccount = asyncHandler(async (req, res) => {
  const { type, data } = req.body; // type: 'bank' | 'wallet'
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng.');
  }

  if (type === 'bank') {
    // Check if bank account already exists to avoid duplicates
    const existingIndex = user.linkedAccounts.banks.findIndex(b => b.accountNumber === data.accountNumber && b.bankId === data.bankId);
    if (existingIndex > -1) {
      user.linkedAccounts.banks[existingIndex] = { ...user.linkedAccounts.banks[existingIndex], ...data };
    } else {
      user.linkedAccounts.banks.push(data);
    }
  } else if (type === 'wallet') {
    const existingIndex = user.linkedAccounts.wallets.findIndex(w => w.walletId === data.walletId && w.phone === data.phone);
    if (existingIndex > -1) {
      user.linkedAccounts.wallets[existingIndex] = { ...user.linkedAccounts.wallets[existingIndex], ...data };
    } else {
      user.linkedAccounts.wallets.push(data);
    }
  } else {
    throw new AppError(400, 'Loại tài khoản liên kết không hợp lệ.');
  }

  await user.save();

  res.json({
    message: 'Liên kết tài khoản thành công.',
    linkedAccounts: user.linkedAccounts
  });
});

export const lookupBankAccount = asyncHandler(async (req, res) => {
  const { bin, accountNumber } = req.body;

  if (!bin || !accountNumber) {
    throw new AppError(400, 'Thiếu thông tin ngân hàng hoặc số tài khoản.');
  }

  try {
    const response = await fetch('https://api.vietqr.io/v2/lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bin,
        accountNumber,
      }),
    });

    const result = await response.json();

    if (result.code === '00' && result.data) {
      res.json({
        success: true,
        accountName: result.data.accountName,
      });
    } else {
      res.json({
        success: false,
        message: result.desc || 'Không tìm thấy thông tin tài khoản.',
      });
    }
  } catch (error) {
    console.error('Lookup error:', error);
    res.json({
      success: false,
      message: 'Lỗi khi tra cứu tài khoản.',
    });
  }
});
