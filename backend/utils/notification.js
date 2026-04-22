import Notification from '../models/Notification.js';
import User from '../models/User.js';

const orderStatusMessages = {
  pending: 'Đơn hàng của bạn đang chờ xác nhận.',
  confirmed: 'Đơn hàng của bạn đã được xác nhận.',
  packing: 'Đơn hàng của bạn đang được đóng gói.',
  shipping: 'Đơn hàng của bạn đang được giao.',
  delivered: 'Đơn hàng của bạn đã được giao thành công.',
  cancelled: 'Đơn hàng của bạn đã bị hủy.',
};

export const createUserNotification = async ({
  userId,
  type = 'system',
  title,
  message,
  data = {},
}) => {
  if (!userId || !title || !message) {
    return null;
  }

  return Notification.create({
    user: userId,
    type,
    title,
    message,
    data,
  });
};

export const createOrderStatusNotification = async (order, messageOverride = '') => {
  const userId = order?.user?._id || order?.user;

  if (!userId) {
    return null;
  }

  const orderId = String(order._id);
  const status = order.status || 'pending';

  return createUserNotification({
    userId,
    type: 'order_status',
    title: `Đơn hàng #${orderId.slice(-6).toUpperCase()} cập nhật`,
    message: messageOverride || orderStatusMessages[status] || 'Đơn hàng của bạn vừa được cập nhật trạng thái.',
    data: {
      orderId: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
    },
  });
};

export const broadcastPromotionNotification = async ({
  title,
  message,
  data = {},
}) => {
  if (!title || !message) {
    return [];
  }

  const users = await User.find({ isActive: true }).select('_id').lean();

  if (!users.length) {
    return [];
  }

  return Notification.insertMany(
    users.map((user) => ({
      user: user._id,
      type: 'promotion',
      title,
      message,
      data,
    }))
  );
};
