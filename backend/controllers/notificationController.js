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

// Get unread notification count (optional: ?type=support | ?excludeTypes=support,promotion)
export const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const singleType = req.query.type ? String(req.query.type).trim() : '';
  const excludeRaw = req.query.excludeTypes ? String(req.query.excludeTypes) : '';

  const filter = { userId, isRead: false };

  if (singleType) {
    filter.type = singleType;
  } else if (excludeRaw) {
    const excluded = excludeRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (excluded.length) {
      filter.type = { $nin: excluded };
    }
  }

  const count = await Notification.countDocuments(filter);

  res.json({
    status: 'success',
    data: { count },
  });
});

// Mark all unread notifications of a given type as read (e.g. support → seen in chat widget)
export const markNotificationsReadByType = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const type = String(req.body?.type || req.query?.type || '').trim();
  const allowed = ['order', 'promotion', 'system', 'support'];

  if (!type || !allowed.includes(type)) {
    return next(new AppError(400, 'Loại thông báo không hợp lệ.'));
  }

  const result = await Notification.updateMany({ userId, isRead: false, type }, { isRead: true });

  res.json({
    status: 'success',
    message: 'Đã cập nhật trạng thái đọc.',
    data: { modifiedCount: result.modifiedCount },
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
