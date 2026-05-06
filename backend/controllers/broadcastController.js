import Broadcast from '../models/Broadcast.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
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
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const broadcasts = await Broadcast.find()
    .limit(limit * 1)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Broadcast.countDocuments();

  res.json({
    status: 'success',
    data: broadcasts,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

// Admin: Delete broadcast
export const deleteAdminBroadcast = asyncHandler(async (req, res, next) => {
  const broadcast = await Broadcast.findByIdAndDelete(req.params.id);

  if (!broadcast) {
    return next(new AppError('Không tìm thấy broadcast', 404));
  }

  res.json({
    status: 'success',
    message: 'Xóa broadcast thành công',
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
  let userQuery = { isActive: true };
  if (broadcast.targetAudience === 'new_users') {
    // Users created in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    userQuery.createdAt = { $gte: sevenDaysAgo };
  } else if (broadcast.targetAudience === 'active_users') {
    // Users who made orders in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    userQuery.lastOrderDate = { $gte: thirtyDaysAgo };
  }

  const users = await User.find(userQuery).select('_id');
  const userIds = users.map((u) => u._id);

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
