import Cart from '../models/Cart.js';
import Voucher from '../models/Voucher.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { recalculateCart } from '../utils/cart.js';
import { buildOwnerQuery, getRequestOwner } from '../utils/requestOwner.js';
import { calculateVoucherDiscount, isVoucherActive } from '../utils/voucher.js';

export const applyVoucher = asyncHandler(async (req, res) => {
  const code = String(req.body.code || '')
    .trim()
    .toUpperCase();

  if (!code) {
    throw new AppError(400, 'Vui lòng nhập mã giảm giá.');
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
