import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import asyncHandler from '../utils/asyncHandler.js';

// Admin: Get dashboard stats
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo } = req.query;

  // Build date filter
  const dateFilter = {};
  if (dateFrom) dateFilter.$gte = new Date(dateFrom);
  if (dateTo) {
    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);
    dateFilter.$lte = endDate;
  }

  const createdAtFilter = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  // Total users
  const totalUsers = await User.countDocuments();

  // New users (this month)
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: firstDayOfMonth },
  });

  // Total orders
  const totalOrders = await Order.countDocuments(createdAtFilter);

  // Total revenue
  const revenueData = await Order.aggregate([
    { $match: { ...createdAtFilter, status: { $in: ['completed', 'delivered'] } } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
  ]);
  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $match: createdAtFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Top products
  const topProducts = await Order.aggregate([
    { $match: createdAtFilter },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    {
      $project: {
        _id: 1,
        product: { name: 1, image: 1 },
        totalSold: 1,
        totalRevenue: 1,
      },
    },
  ]);

  // Average rating
  const averageRating = await Review.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$rating' } } },
  ]);

  // Total reviews
  const totalReviews = await Review.countDocuments();

  res.json({
    status: 'success',
    data: {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
      },
      orders: {
        total: totalOrders,
        byStatus: ordersByStatus,
      },
      revenue: {
        total: totalRevenue,
      },
      products: {
        topSold: topProducts,
      },
      reviews: {
        total: totalReviews,
        averageRating: averageRating[0]?.avgRating || 0,
      },
    },
  });
});
