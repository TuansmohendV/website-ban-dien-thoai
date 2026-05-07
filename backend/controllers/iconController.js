import Icon from '../models/Icon.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// Admin: Create icon
export const createAdminIcon = asyncHandler(async (req, res, next) => {
  const { name, url, category } = req.body;

  if (!name || !url) {
    return next(new AppError('Vui lòng nhập tên và URL icon', 400));
  }

  const icon = await Icon.create({ name, url, category });

  res.status(201).json({
    status: 'success',
    message: 'Tạo icon thành công',
    data: { icon },
  });
});

// Admin: Get icons
export const getAdminIcons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (category) query.category = category;

  const icons = await Icon.find(query)
    .limit(limit * 1)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Icon.countDocuments(query);

  res.json({
    status: 'success',
    data: icons,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

// Admin: Delete icon
export const deleteAdminIcon = asyncHandler(async (req, res, next) => {
  const icon = await Icon.findByIdAndDelete(req.params.id);

  if (!icon) {
    return next(new AppError('Không tìm thấy icon', 404));
  }

  res.json({
    status: 'success',
    message: 'Xóa icon thành công',
  });
});

// Public: Get icons
export const getIcons = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const query = { isActive: true };
  if (category) query.category = category;

  const icons = await Icon.find(query).sort({ createdAt: -1 });

  res.json({
    status: 'success',
    data: icons,
  });
});
