import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// Add to wishlist
export const addWishlistItem = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user._id;

  if (!productId) {
    return next(new AppError('Vui lòng cung cấp productId', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  let wishlistItem = await Wishlist.findOne({ userId, productId, isDeleted: { $ne: true } });
  if (wishlistItem) {
    return next(new AppError('Sản phẩm đã có trong danh sách yêu thích', 409));
  }

  wishlistItem = await Wishlist.findOneAndUpdate(
    { userId, productId },
    { $set: { userId, productId, isDeleted: false }, $unset: { deletedAt: '' } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({
    status: 'success',
    message: 'Thêm vào danh sách yêu thích thành công',
    data: { wishlistItem },
  });
});

// Get wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user._id;
  const skip = (page - 1) * limit;

  const items = await Wishlist.find({ userId, isDeleted: { $ne: true } })
    .populate('productId', 'name image price rating')
    .limit(limit * 1)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Wishlist.countDocuments({ userId, isDeleted: { $ne: true } });

  res.json({
    status: 'success',
    data: items,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

// Get wishlist count
export const getWishlistCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const count = await Wishlist.countDocuments({ userId, isDeleted: { $ne: true } });

  res.json({
    status: 'success',
    data: { count },
  });
});

// Remove from wishlist
export const removeWishlistItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const item = await Wishlist.findOneAndUpdate(
    { _id: id, userId, isDeleted: { $ne: true } },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true }
  );

  if (!item) {
    return next(new AppError('Không tìm thấy item trong danh sách yêu thích', 404));
  }

  res.json({
    status: 'success',
    message: 'Xóa khỏi danh sách yêu thích thành công',
  });
});
