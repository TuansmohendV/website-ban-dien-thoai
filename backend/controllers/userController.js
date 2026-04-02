import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { normalizePhone } from '../utils/phone.js';

export const getUserProfile = asyncHandler(async (req, res) => {
  res.json({
    user: req.user,
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
