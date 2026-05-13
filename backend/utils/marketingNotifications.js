import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendMarketingEmail } from './email.js';

const MAX_RECIPIENTS = Number(process.env.MARKETING_EMAIL_LIMIT || 100);

export const formatVnd = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value || 0));

export const notifyCustomersByEmail = async ({ subject, title, content, buttonText, buttonUrl }) => {
  const users = await User.find({
    role: 'customer',
    isActive: true,
    email: { $exists: true, $ne: '' },
  })
    .select('email')
    .limit(MAX_RECIPIENTS)
    .lean();

  await Promise.allSettled(
    users.map((user) =>
      sendMarketingEmail({
        to: user.email,
        subject,
        title,
        content,
        buttonText,
        buttonUrl,
      })
    )
  );

  return users.length;
};

export const notifyCustomersInApp = async ({ title, message, type = 'promotion', relatedId, relatedType }) => {
  const users = await User.find({
    role: 'customer',
    isActive: true,
  })
    .select('_id')
    .limit(MAX_RECIPIENTS)
    .lean();

  if (!users.length) {
    return 0;
  }

  await Notification.insertMany(
    users.map((user) => ({
      userId: user._id,
      title,
      message,
      type,
      relatedId,
      relatedType,
    }))
  );

  return users.length;
};

export const notifyNewProductEmail = (product) => {
  const websiteUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const buttonUrl = product.slug
    ? `${websiteUrl}/product/${product.slug}`
    : websiteUrl;

  return notifyCustomersByEmail({
    subject: `PhoneSin - Sản phẩm mới: ${product.name}`,
    title: 'Có sản phẩm mới tại PhoneSin',
    content: `
      <p>PhoneSin vừa cập nhật sản phẩm mới: <strong>${product.name}</strong>.</p>
      <p>Giá bán: <strong style="color:#ee0000;">${formatVnd(product.price)}</strong></p>
      <p>Ghé xem chi tiết để không bỏ lỡ hàng mới nhé.</p>
    `,
    buttonText: 'Xem sản phẩm',
    buttonUrl,
  });
};

export const notifyNewProductInApp = (product) =>
  notifyCustomersInApp({
    title: 'Có sản phẩm mới',
    message: `${product.name} vừa được thêm vào cửa hàng với giá ${formatVnd(product.price)}.`,
    type: 'promotion',
    relatedId: product._id,
    relatedType: 'product',
  });

export const notifyNewVoucherEmail = (voucher) => {
  const websiteUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const valueText =
    voucher.discountType === 'percentage'
      ? `${voucher.discountValue}%`
      : formatVnd(voucher.discountValue);

  return notifyCustomersByEmail({
    subject: `PhoneSin - Voucher mới ${voucher.code}`,
    title: 'Bạn có mã giảm giá mới',
    content: `
      <p>Mã giảm giá mới vừa được mở: <strong style="font-size:20px; color:#008d71;">${voucher.code}</strong></p>
      <p>Ưu đãi: <strong>${valueText}</strong>${voucher.minOrderValue > 0 ? ` cho đơn từ <strong>${formatVnd(voucher.minOrderValue)}</strong>` : ''}.</p>
      ${voucher.expiresAt ? `<p>Hạn dùng đến: <strong>${new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}</strong></p>` : ''}
    `,
    buttonText: 'Lấy mã ngay',
    buttonUrl: `${websiteUrl}/flash-voucher`,
  });
};

export const notifyNewVoucherInApp = (voucher) => {
  const valueText =
    voucher.discountType === 'percentage'
      ? `${voucher.discountValue}%`
      : formatVnd(voucher.discountValue);

  return notifyCustomersInApp({
    title: 'Voucher mới dành cho bạn',
    message: `Nhập mã ${voucher.code} để được giảm ${valueText}.`,
    type: 'promotion',
    relatedId: voucher._id,
    relatedType: 'voucher',
  });
};
