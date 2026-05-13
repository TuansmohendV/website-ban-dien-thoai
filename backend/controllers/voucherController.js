import Cart from '../models/Cart.js';
import Voucher from '../models/Voucher.js';
import UserVoucher from '../models/UserVoucher.js';
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
    isHuntedOnly: body.isHuntedOnly === true,
    missionTask: String(body.missionTask || '').trim(),
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

export const getPublicVouchers = asyncHandler(async (req, res) => {
  const now = new Date();
  
  const vouchers = await Voucher.find({
    isActive: true,
    isHuntedOnly: { $ne: true },
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }],
    $or: [{ startsAt: { $exists: false } }, { startsAt: { $lt: now } }],
  })
    .sort({ discountValue: -1 })
    .lean();

  res.json({
    data: vouchers.map((v) => ({
      code: v.code,
      description: v.description,
      discountType: v.discountType,
      discountValue: v.discountValue,
      minOrderValue: v.minOrderValue,
      maxDiscount: v.maxDiscount,
      expiresAt: v.expiresAt,
    })),
  });
});

export const getHuntedVouchers = asyncHandler(async (req, res) => {
  const now = new Date();
  
  const vouchers = await Voucher.find({
    isActive: true,
    isHuntedOnly: true,
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }],
    $or: [{ startsAt: { $exists: false } }, { startsAt: { $lt: now } }],
  })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    data: vouchers.map((v) => ({
      _id: v._id,
      code: v.code,
      description: v.description,
      discountType: v.discountType,
      discountValue: v.discountValue,
      minOrderValue: v.minOrderValue,
      maxDiscount: v.maxDiscount,
      expiresAt: v.expiresAt,
      missionTask: v.missionTask
    })),
  });
});

export const huntVoucher = asyncHandler(async (req, res) => {
  const { voucherId, proofImage } = req.body;
  
  const voucher = await Voucher.findById(voucherId);
  if (!voucher || !isVoucherActive(voucher)) {
    throw new AppError(400, 'Voucher không khả dụng để săn.');
  }

  const existing = await UserVoucher.findOne({ user: req.user._id, voucher: voucherId });
  if (existing) {
    if (existing.status === 'pending') throw new AppError(400, 'Bạn đã gửi minh chứng, vui lòng chờ Admin duyệt.');
    if (existing.status === 'approved') throw new AppError(400, 'Bạn đã sở hữu voucher này rồi.');
    // If rejected, let them try again
  }

  if (existing && existing.status === 'rejected') {
    existing.status = 'pending';
    existing.proofImage = proofImage;
    existing.huntedAt = new Date();
    await existing.save();
  } else {
    await UserVoucher.create({
      user: req.user._id,
      voucher: voucherId,
      proofImage,
      status: 'pending'
    });
  }

  res.status(201).json({
    message: 'Gửi minh chứng thành công! Vui lòng chờ Admin duyệt để nhận mã.',
  });
});

export const getUserVouchers = asyncHandler(async (req, res) => {
  const userVouchers = await UserVoucher.find({ 
    user: req.user._id, 
    isUsed: false,
    status: 'approved' // Only show approved ones
  })
    .populate('voucher')
    .lean();

  res.json({
    data: userVouchers.filter(uv => uv.voucher && uv.voucher.isActive).map(uv => ({
      code: uv.voucher.code,
      description: uv.voucher.description,
      discountType: uv.voucher.discountType,
      discountValue: uv.voucher.discountValue,
      minOrderValue: uv.voucher.minOrderValue,
      maxDiscount: uv.voucher.maxDiscount,
      expiresAt: uv.voucher.expiresAt,
      earnedAt: uv.huntedAt
    }))
  });
});

// Admin Review APIs
export const getPendingProofs = asyncHandler(async (req, res) => {
  const proofs = await UserVoucher.find({ status: 'pending' })
    .populate('user', 'fullName phone email')
    .populate('voucher')
    .sort({ createdAt: -1 })
    .lean();

  res.json({ data: proofs });
});

export const reviewProof = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNote } = req.body; // status: 'approved' or 'rejected'

  const userVoucher = await UserVoucher.findById(id);
  if (!userVoucher) throw new AppError(404, 'Không tìm thấy minh chứng.');

  userVoucher.status = status;
  userVoucher.adminNote = adminNote;
  await userVoucher.save();

  res.json({ message: `Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} minh chứng này.` });
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
  const voucher = await Voucher.findById(req.params.id);

  if (!voucher) {
    throw new AppError(404, 'Không tìm thấy mã khuyến mãi.');
  }

  voucher.isActive = false;
  await voucher.save();

  res.json({
    message: 'Chuyển mã khuyến mãi vào trạng thái đã tắt (xoá mềm) thành công.',
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

  if (voucher.isHuntedOnly) {
    if (!req.user) {
      throw new AppError(401, 'Vui lòng đăng nhập để sử dụng mã ưu đãi đặc biệt này.');
    }
    const userVoucher = await UserVoucher.findOne({ 
      user: req.user._id, 
      voucher: voucher._id,
      status: 'approved' // CHECK STATUS
    });
    if (!userVoucher) {
      throw new AppError(400, 'Mã này yêu cầu bạn phải săn voucher và được Admin duyệt mới có thể sử dụng.');
    }
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
