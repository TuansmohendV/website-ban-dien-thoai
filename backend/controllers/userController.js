import User from '../models/User.js';
import Order from '../models/Order.js';
import Wishlist from '../models/Wishlist.js';
import Review from '../models/Review.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { normalizePhone } from '../utils/phone.js';

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
  const users = await User.find({})
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

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng.');
  }

  res.json({
    message: 'Xóa người dùng thành công.',
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

  await user.save();

  res.json({
    message: 'Cập nhật hồ sơ thành công.',
    user,
  });
});
