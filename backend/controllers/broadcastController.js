import Broadcast from '../models/Broadcast.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// Admin: Create broadcast
export const createAdminBroadcast = asyncHandler(async (req, res, next) => {
  const { title, message, targetAudience } = req.body;

  if (!title || !message) {
    return next(new AppError('Vui lòng nhập tiêu đề và nội dung', 400));
  }

  const broadcast = await Broadcast.create({
    title,
    message,
    targetAudience,
  });

  res.status(201).json({
    status: 'success',
    message: 'Tạo thông báo broadcast thành công',
    data: { broadcast },
  });
});

// Admin: Get broadcasts
export const getAdminBroadcasts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, includeInactive } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (String(includeInactive) !== 'true') {
    query.isActive = true;
  }

  const broadcasts = await Broadcast.find(query)
    .limit(limit * 1)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Broadcast.countDocuments(query);

  res.json({
    status: 'success',
    data: broadcasts,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

// Admin: Delete broadcast
export const deleteAdminBroadcast = asyncHandler(async (req, res, next) => {
  const broadcast = await Broadcast.findById(req.params.id);

  if (!broadcast) {
    return next(new AppError('Không tìm thấy broadcast', 404));
  }

  broadcast.isActive = false;
  await broadcast.save();

  res.json({
    status: 'success',
    message: 'Chuyển broadcast vào trạng thái đã ẩn (xoá mềm) thành công',
  });
});

// Admin: Send broadcast (trigger notifications)
export const sendBroadcast = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const broadcast = await Broadcast.findById(id);
  if (!broadcast) {
    return next(new AppError('Không tìm thấy broadcast', 404));
  }

  // Get target users
  let userIds = [];

  if (broadcast.targetAudience === 'all') {
    const users = await User.find({ isActive: true }).select('_id');
    userIds = users.map(u => u._id);
  } else if (broadcast.targetAudience === 'new_users') {
    // Users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const users = await User.find({ isActive: true, createdAt: { $gte: thirtyDaysAgo } }).select('_id');
    userIds = users.map(u => u._id);
  } else if (broadcast.targetAudience === 'active_users') {
    // VIP Users: Total spent > 20M VND or > 2 successful orders
    const vipData = await Order.aggregate([
      { $match: { status: 'delivered', user: { $exists: true } } },
      { $group: { 
        _id: '$user', 
        totalSpent: { $sum: '$total' },
        orderCount: { $sum: 1 }
      }},
      { $match: { $or: [ { totalSpent: { $gte: 20000000 } }, { orderCount: { $gte: 2 } } ] } }
    ]);
    userIds = vipData.map(d => d._id);
  } else if (broadcast.targetAudience === 'unpurchased_users') {
    // Users who never made a successful purchase
    const buyers = await Order.distinct('user', { status: 'delivered', user: { $exists: true } });
    const nonBuyers = await User.find({ 
      isActive: true, 
      _id: { $nin: buyers },
      role: 'customer' 
    }).select('_id');
    userIds = nonBuyers.map(u => u._id);
  }

  // Create notifications
  const notifications = userIds.map((userId) => ({
    userId,
    title: broadcast.title,
    message: broadcast.message,
    type: 'promotion',
    relatedId: broadcast._id,
    relatedType: 'broadcast',
  }));

  await Notification.insertMany(notifications);

  broadcast.isSent = true;
  broadcast.sentAt = new Date();
  await broadcast.save();

  res.json({
    status: 'success',
    message: `Gửi broadcast đến ${userIds.length} người dùng thành công`,
    data: { broadcast, sentTo: userIds.length },
  });
});
