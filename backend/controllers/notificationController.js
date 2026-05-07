import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// Get user notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user._id;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId })
    .limit(limit * 1)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Notification.countDocuments({ userId });

  res.json({
    status: 'success',
    data: notifications,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

// Get unread notification count
export const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const count = await Notification.countDocuments({ userId, isRead: false });

  res.json({
    status: 'success',
    data: { count },
  });
});

// Mark notification as read
export const markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('Không tìm thấy thông báo', 404));
  }

  res.json({
    status: 'success',
    message: 'Đánh dấu đã đọc thành công',
    data: { notification },
  });
});

// Mark all notifications as read
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany({ userId, isRead: false }, { isRead: true });

  res.json({
    status: 'success',
    message: 'Đánh dấu tất cả thông báo đã đọc',
  });
});
