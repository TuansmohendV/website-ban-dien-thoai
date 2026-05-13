import Brand from '../models/Brand.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// Admin: Create Brand
export const createAdminBrand = asyncHandler(async (req, res, next) => {
  const { name, logo, description, website } = req.body;

  if (!name) {
    return next(new AppError('Vui lòng nhập tên thương hiệu', 400));
  }

  const existingBrand = await Brand.findOne({ name });
  if (existingBrand) {
    return next(new AppError('Thương hiệu đã tồn tại', 409));
  }

  const brand = await Brand.create({
    name,
    logo,
    description,
    website,
  });

  res.status(201).json({
    status: 'success',
    message: 'Tạo thương hiệu thành công',
    data: { brand },
  });
});

// Admin: Get all brands
export const getAdminBrands = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const brands = await Brand.find(query)
    .limit(limit * 1)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Brand.countDocuments(query);

  res.json({
    status: 'success',
    data: brands,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    },
  });
});

// Admin: Get brand detail
export const getAdminBrandDetail = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new AppError('Không tìm thấy thương hiệu', 404));
  }

  res.json({
    status: 'success',
    data: { brand },
  });
});

// Admin: Update brand
export const updateAdminBrand = asyncHandler(async (req, res, next) => {
  const { name, logo, description, website, isActive, displayOrder } = req.body;

  let brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new AppError('Không tìm thấy thương hiệu', 404));
  }

  if (name && name !== brand.name) {
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return next(new AppError('Tên thương hiệu đã tồn tại', 409));
    }
  }

  brand = await Brand.findByIdAndUpdate(
    req.params.id,
    { name, logo, description, website, isActive, displayOrder },
    { new: true, runValidators: true }
  );

  res.json({
    status: 'success',
    message: 'Cập nhật thương hiệu thành công',
    data: { brand },
  });
});

// Admin: Delete brand
export const deleteAdminBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new AppError('Không tìm thấy thương hiệu', 404));
  }

  brand.isActive = false;
  await brand.save();

  res.json({
    status: 'success',
    message: 'Chuyển thương hiệu vào trạng thái đã ẩn (xoá mềm) thành công',
  });
});

// Public: Get all brands
export const getBrands = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const brands = await Brand.find({ isActive: true })
    .limit(limit * 1)
    .skip(skip)
    .sort({ displayOrder: 1, createdAt: -1 });

  const total = await Brand.countDocuments({ isActive: true });

  res.json({
    status: 'success',
    data: brands,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    },
  });
});

// Public: Get brand detail
export const getBrandDetail = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findOne({ _id: req.params.id, isActive: true });

  if (!brand) {
    return next(new AppError('Không tìm thấy thương hiệu', 404));
  }

  res.json({
    status: 'success',
    data: { brand },
  });
});
