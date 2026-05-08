import Cart from '../models/Cart.js';
import Voucher from '../models/Voucher.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { recalculateCart } from '../utils/cart.js';
import { buildOwnerQuery, getRequestOwner } from '../utils/requestOwner.js';
import { calculateVoucherDiscount, isVoucherActive } from '../utils/voucher.js';

const normalizeVoucherPayload = (body = {}) => {
  const code = String(body.code || '').trim().toUpperCase();
  const discountType = body.discountType === 'percentage' ? 'percentage' : 'fixed';
  const discountValue = Math.max(0, Number(body.discountValue) || 0);
  const minOrderValue = Math.max(0, Number(body.minOrderValue) || 0);
  const maxDiscount = Math.max(0, Number(body.maxDiscount) || 0);
  const usageLimit = Math.max(0, Number(body.usageLimit) || 0);
  const usageLimitPerUser = Math.max(0, Number(body.usageLimitPerUser) || 1);

  return {
    code,
    description: String(body.description || '').trim(),
    discountType,
    discountValue,
    minOrderValue,
    maxDiscount,
    usageLimit,
    usageLimitPerUser,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
    isActive: body.isActive !== false,
  };
};

const getVoucherStatus = (voucher) => {
  if (!voucher.isActive) return 'Tạm tắt';
  if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) return 'Hết hạn';
  if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) return 'Hết lượt';
  return 'Hoạt động';
};

const mapVoucherForAdmin = (voucher) => ({
  ...voucher,
  status: getVoucherStatus(voucher),
});

export const getAdminVouchers = asyncHandler(async (req, res) => {
  const vouchers = await Voucher.find({}).sort({ createdAt: -1 }).lean();

  res.json({
    data: vouchers.map(mapVoucherForAdmin),
  });
});

export const getAdminVoucherDetail = asyncHandler(async (req, res) => {
  const voucher = await Voucher.findById(req.params.id).lean();

  if (!voucher) {
    throw new AppError(404, 'Không tìm thấy mã khuyến mãi.');
  }

  res.json({
    voucher: mapVoucherForAdmin(voucher),
  });
});

export const createAdminVoucher = asyncHandler(async (req, res) => {
  const payload = normalizeVoucherPayload(req.body);

  if (!payload.code) {
    throw new AppError(400, 'Vui lòng nhập mã khuyến mãi.');
  }

  if (payload.discountValue <= 0) {
    throw new AppError(400, 'Giá trị giảm phải lớn hơn 0.');
  }

  const voucher = await Voucher.create(payload);

  res.status(201).json({
    message: 'Tạo mã khuyến mãi thành công.',
    voucher: mapVoucherForAdmin(voucher.toObject()),
  });
});

export const updateAdminVoucher = asyncHandler(async (req, res) => {
  const voucher = await Voucher.findById(req.params.id);

  if (!voucher) {
    throw new AppError(404, 'Không tìm thấy mã khuyến mãi.');
  }

  Object.assign(voucher, normalizeVoucherPayload(req.body));
  await voucher.save();

  res.json({
    message: 'Cập nhật mã khuyến mãi thành công.',
    voucher: mapVoucherForAdmin(voucher.toObject()),
  });
});

export const deleteAdminVoucher = asyncHandler(async (req, res) => {
  const voucher = await Voucher.findByIdAndDelete(req.params.id);

  if (!voucher) {
    throw new AppError(404, 'Không tìm thấy mã khuyến mãi.');
  }

  res.json({
    message: 'Xóa mã khuyến mãi thành công.',
  });
});

export const applyVoucher = asyncHandler(async (req, res) => {
  const code = String(req.body.code || '')
    .trim()
    .toUpperCase();

  const owner = getRequestOwner(req, {
    allowGuest: true,
    throwIfMissing: false,
  });

  let cart = null;
  let subtotal = Number(req.body.amount) || 0;

  if (owner) {
    cart = await Cart.findOne(buildOwnerQuery(owner));

    if (cart) {
      recalculateCart(cart);
      subtotal = cart.subtotal;
    }
  }

  if (!code) {
    if (!cart) {
      throw new AppError(400, 'Vui lòng nhập mã giảm giá.');
    }

    cart.voucherCode = '';
    cart.voucherSnapshot = undefined;
    recalculateCart(cart);
    await cart.save();

    return res.json({
      message: 'Đã gỡ mã giảm giá.',
      voucher: null,
      subtotal: cart.subtotal,
      discountAmount: 0,
      totalAfterDiscount: cart.total,
    });
  }

  const voucher = await Voucher.findOne({ code });

  if (!voucher || !isVoucherActive(voucher)) {
    throw new AppError(400, 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
  }

  if (req.user && voucher.usageLimitPerUser > 0) {
    const usageByUser = voucher.usageByUser.find(
      (item) => String(item.user) === String(req.user._id)
    );

    if ((usageByUser?.count || 0) >= voucher.usageLimitPerUser) {
      throw new AppError(400, 'Bạn đã dùng hết lượt áp mã này.');
    }
  }

  const result = calculateVoucherDiscount(voucher, subtotal);

  if (!result.isValid) {
    throw new AppError(400, result.message);
  }

  if (cart) {
    cart.voucherCode = voucher.code;
    cart.voucherSnapshot = {
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      maxDiscount: voucher.maxDiscount,
      minOrderValue: voucher.minOrderValue,
    };

    recalculateCart(cart);
    await cart.save();
  }

  res.json({
    message: result.message,
    voucher: {
      code: voucher.code,
      description: voucher.description,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
    },
    subtotal,
    discountAmount: result.discountAmount,
    totalAfterDiscount: subtotal - result.discountAmount,
  });
});
