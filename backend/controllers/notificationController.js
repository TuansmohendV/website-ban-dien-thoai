import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 15, 1), 50);
  const skip = (page - 1) * limit;
  const query = {
    user: req.user._id,
  };

  if (req.query.isRead === 'true') {
    query.isRead = true;
  }

  if (req.query.isRead === 'false') {
    query.isRead = false;
  }

  const [total, data] = await Promise.all([
    Notification.countDocuments(query),
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  res.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const total = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  res.json({
    total,
  });
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    throw new AppError(404, 'Không tìm thấy thông báo.');
  }

  notification.isRead = true;
  notification.readAt = notification.readAt || new Date();
  await notification.save();

  res.json({
    message: 'Đã đánh dấu thông báo là đã đọc.',
    notification,
  });
});

export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      user: req.user._id,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  res.json({
    message: 'Đã đánh dấu tất cả thông báo là đã đọc.',
  });
});
