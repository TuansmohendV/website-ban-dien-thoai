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

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: purchasedOrder?._id,
    rating,
    title,
    comment,
    images,
    isVerifiedPurchase: Boolean(purchasedOrder),
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
    Review.countDocuments({ product: req.params.productId, isActive: true }),
    Review.find({ product: req.params.productId, isActive: true })
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
    Review.countDocuments({ isActive: true }),
    Review.aggregate([
      { $match: { isActive: true } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      // Join with product
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      // Join with user
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      // Join with orders to check VIP status
      {
        $lookup: {
          from: 'orders',
          let: { userId: '$user._id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user', '$$userId'] }, status: 'delivered' } },
            { $group: { _id: null, totalSpent: { $sum: '$total' }, count: { $sum: 1 } } }
          ],
          as: 'userStats'
        }
      },
      { $unwind: { path: '$userStats', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          'user.isVIP': {
            $or: [
              { $gte: ['$userStats.totalSpent', 20000000] },
              { $gte: ['$userStats.count', 2] }
            ]
          },
          'user.totalSpent': { $ifNull: ['$userStats.totalSpent', 0] },
          'user.orderCount': { $ifNull: ['$userStats.count', 0] }
        }
      },
      // Cleanup sensitive data
      { $project: { 'user.password': 0, 'user.resetPasswordToken': 0, 'user.resetPasswordExpiresAt': 0 } }
    ])
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

export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id, isActive: true })
    .populate('product', 'name slug image')
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    data: reviews,
    total: reviews.length,
  });
});

export const updateMyReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError(404, 'Không tìm thấy đánh giá.');
  }

  if (String(review.user) !== String(req.user._id)) {
    throw new AppError(403, 'Bạn không có quyền sửa đánh giá này.');
  }

  const nextRating = Number(req.body.rating);
  const nextComment = String(req.body.comment || '').trim();

  if (!nextRating || nextRating < 1 || nextRating > 5) {
    throw new AppError(400, 'Số sao đánh giá phải từ 1 đến 5.');
  }

  if (!nextComment) {
    throw new AppError(400, 'Vui lòng nhập nội dung đánh giá.');
  }

  review.rating = nextRating;
  review.comment = nextComment;
  review.title = req.body.title ? String(req.body.title).trim() : review.title;
  review.moderationStatus = 'pending';
  review.moderationNote = '';
  await review.save();
  await syncProductReviewStats(review.product);

  res.json({
    message: 'Cập nhật đánh giá thành công.',
    review,
  });
});

export const deleteMyReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError(404, 'Không tìm thấy đánh giá.');
  }

  if (String(review.user) !== String(req.user._id)) {
    throw new AppError(403, 'Bạn không có quyền xóa đánh giá này.');
  }

  const productId = review.product;
  review.isActive = false;
  await review.save();
  await syncProductReviewStats(productId);

  res.json({
    message: 'Đã ẩn đánh giá của bạn (xoá mềm) thành công.',
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
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError(404, 'Không tìm thấy đánh giá.');
  }

  review.isActive = false;
  await review.save();
  await syncProductReviewStats(review.product);

  res.json({
    message: 'Chuyển đánh giá vào trạng thái đã ẩn (xoá mềm) thành công.',
  });
});
