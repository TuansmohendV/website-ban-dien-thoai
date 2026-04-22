import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import SearchHistory from '../models/SearchHistory.js';
import User from '../models/User.js';
import Wishlist from '../models/Wishlist.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { normalizePhone } from '../utils/phone.js';

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

const buildWishlistLookup = async (userId) => {
  const items = await Wishlist.find({ user: userId })
    .populate(
      'product',
      'name slug image price originalPrice brand brandRef category categoryRef rating numReviews countInStock status'
    )
    .sort({ createdAt: -1 })
    .lean();

  return items
    .filter((item) => item.product)
    .map((item) => ({
      _id: item._id,
      createdAt: item.createdAt,
      product: item.product,
    }));
};

export const getUserProfile = asyncHandler(async (req, res) => {
  res.json({
    user: sanitizeUser(req.user),
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
    user: sanitizeUser(user),
  });
});

export const getUserStats = asyncHandler(async (req, res) => {
  const [orderSummary, wishlistCount, reviewedProductsCount] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          user: req.user._id,
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0],
            },
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0],
            },
          },
          totalSpent: {
            $sum: {
              $cond: [{ $ne: ['$status', 'cancelled'] }, '$total', 0],
            },
          },
          recognizedSpent: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, '$total', 0],
            },
          },
        },
      },
    ]),
    Wishlist.countDocuments({ user: req.user._id }),
    Review.countDocuments({ user: req.user._id }),
  ]);

  const summary = orderSummary[0] || {
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalSpent: 0,
    recognizedSpent: 0,
  };

  res.json({
    stats: {
      totalOrders: summary.totalOrders,
      completedOrders: summary.completedOrders,
      cancelledOrders: summary.cancelledOrders,
      activeOrders: Math.max(
        summary.totalOrders - summary.completedOrders - summary.cancelledOrders,
        0
      ),
      totalSpent: summary.totalSpent,
      recognizedSpent: summary.recognizedSpent,
      wishlistCount,
      reviewedProductsCount,
    },
  });
});

export const getWishlist = asyncHandler(async (req, res) => {
  const data = await buildWishlistLookup(req.user._id);

  res.json({
    data,
    total: data.length,
  });
});

export const getWishlistCount = asyncHandler(async (req, res) => {
  const total = await Wishlist.countDocuments({ user: req.user._id });

  res.json({
    total,
  });
});

export const addWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new AppError(400, 'Vui lòng cung cấp productId để thêm yêu thích.');
  }

  const product = await Product.findOne({
    _id: productId,
    status: 'active',
  }).select('_id name');

  if (!product) {
    throw new AppError(404, 'Không tìm thấy sản phẩm để thêm vào yêu thích.');
  }

  await Wishlist.findOneAndUpdate(
    {
      user: req.user._id,
      product: product._id,
    },
    {
      $setOnInsert: {
        user: req.user._id,
        product: product._id,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  res.status(201).json({
    message: 'Đã thêm sản phẩm vào danh sách yêu thích.',
    total: await Wishlist.countDocuments({ user: req.user._id }),
  });
});

export const removeWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const deletedItem = await Wishlist.findOneAndDelete({
    user: req.user._id,
    product: productId,
  });

  if (!deletedItem) {
    throw new AppError(404, 'Sản phẩm này chưa có trong danh sách yêu thích.');
  }

  res.json({
    message: 'Đã xóa sản phẩm khỏi danh sách yêu thích.',
    total: await Wishlist.countDocuments({ user: req.user._id }),
  });
});

export const getSearchHistory = asyncHandler(async (req, res) => {
  const history = await SearchHistory.find({ user: req.user._id })
    .sort({ lastSearchedAt: -1 })
    .limit(20)
    .lean();

  res.json({
    data: history,
  });
});

export const deleteSearchHistoryItem = asyncHandler(async (req, res) => {
  const deletedItem = await SearchHistory.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!deletedItem) {
    throw new AppError(404, 'Không tìm thấy lịch sử tìm kiếm để xóa.');
  }

  res.json({
    message: 'Đã xóa lịch sử tìm kiếm.',
  });
});

export const clearSearchHistory = asyncHandler(async (req, res) => {
  await SearchHistory.deleteMany({ user: req.user._id });

  res.json({
    message: 'Đã xóa toàn bộ lịch sử tìm kiếm.',
  });
});
