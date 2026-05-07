import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

const syncProductReviewStats = async (productId) => {
  const [stats] = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    rating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
    numReviews: stats?.totalReviews || 0,
  });
};

export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment, images = [] } = req.body;

  if (!productId || !rating) {
    throw new AppError(400, 'Vui lòng chọn sản phẩm và số sao đánh giá.');
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError(404, 'Sản phẩm cần đánh giá không tồn tại.');
  }

  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id,
  });

  if (existingReview) {
    throw new AppError(409, 'Bạn đã đánh giá sản phẩm này rồi.');
  }

  const purchasedOrder = await Order.findOne({
    user: req.user._id,
    status: { $ne: 'cancelled' },
    'items.product': productId,
  });

  if (!purchasedOrder) {
    throw new AppError(
      403,
      'Bạn chỉ có thể đánh giá sản phẩm đã từng mua trong hệ thống.'
    );
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: purchasedOrder._id,
    rating,
    title,
    comment,
    images,
    isVerifiedPurchase: true,
  });

  await syncProductReviewStats(productId);

  res.status(201).json({
    message: 'Đánh giá sản phẩm thành công.',
    review,
  });
});

export const getReviewsByProductId = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 30);
  const skip = (page - 1) * limit;

  const product = await Product.findById(req.params.productId).select(
    'name rating numReviews'
  );

  if (!product) {
    throw new AppError(404, 'Không tìm thấy sản phẩm để lấy đánh giá.');
  }

  const [total, reviews] = await Promise.all([
    Review.countDocuments({ product: req.params.productId }),
    Review.find({ product: req.params.productId })
      .populate('user', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.json({
    product,
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const getAdminReviews = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const [total, reviews] = await Promise.all([
    Review.countDocuments({}),
    Review.find({})
      .populate('user', 'fullName avatar email')
      .populate('product', 'name slug image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  res.json({
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const updateAdminReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError(404, 'Không tìm thấy đánh giá.');
  }

  if (req.body.moderationStatus !== undefined) {
    review.moderationStatus = req.body.moderationStatus;
  }

  if (req.body.moderationNote !== undefined) {
    review.moderationNote = req.body.moderationNote;
  }

  await review.save();

  res.json({
    message: 'Cập nhật đánh giá thành công.',
    review,
  });
});

export const deleteAdminReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    throw new AppError(404, 'Không tìm thấy đánh giá.');
  }

  await syncProductReviewStats(review.product);

  res.json({
    message: 'Xóa đánh giá thành công.',
  });
});
