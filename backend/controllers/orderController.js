import Address from '../models/Address.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import Voucher from '../models/Voucher.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { recalculateCart } from '../utils/cart.js';
import { createTimelineEntry } from '../utils/order.js';
import { buildOwnerQuery, getRequestOwner } from '../utils/requestOwner.js';
import { calculateVoucherDiscount, isVoucherActive } from '../utils/voucher.js';

const hydrateOrder = async (query) => {
  return Order.findOne(query)
    .populate('items.product', 'name slug image')
    .populate('items.variant', 'color storage image')
    .populate('user', 'fullName email phone');
};

const syncCartItemsWithInventory = async (cart) => {
  for (const item of cart.items) {
    const product = await Product.findById(item.product);

    if (!product || product.status !== 'active') {
      throw new AppError(
        400,
        `Sản phẩm ${item.name} hiện không còn khả dụng để đặt hàng.`
      );
    }

    if (item.variant) {
      const variant = await ProductVariant.findById(item.variant);

      if (!variant || !variant.isActive) {
        throw new AppError(400, `Biến thể của ${item.name} không còn khả dụng.`);
      }

      if (variant.stock < item.quantity) {
        throw new AppError(
          400,
          `Biến thể ${item.name} không đủ hàng trong kho.`
        );
      }

      item.unitPrice = variant.price;
      item.image = variant.image || product.image;
      item.selectedColor = variant.color || item.selectedColor;
      item.selectedStorage = variant.storage || item.selectedStorage;
      item.maxStock = variant.stock;
    } else {
      if (product.countInStock < item.quantity) {
        throw new AppError(400, `Sản phẩm ${item.name} không đủ hàng trong kho.`);
      }

      item.unitPrice = product.price;
      item.image = product.image;
      item.maxStock = product.countInStock;
    }

    item.name = product.name;
    item.lineTotal = item.unitPrice * item.quantity;
  }

  recalculateCart(cart);
};

const adjustInventory = async (items, direction) => {
  for (const item of items) {
    if (item.variant) {
      const variant = await ProductVariant.findById(item.variant);

      if (!variant) {
        continue;
      }

      const nextStock = variant.stock + direction * item.quantity;

      if (nextStock < 0) {
        throw new AppError(
          400,
          `Tồn kho biến thể ${item.name} không đủ để tạo đơn hàng.`
        );
      }

      variant.stock = nextStock;
      await variant.save();
    } else {
      const product = await Product.findById(item.product);

      if (!product) {
        continue;
      }

      const nextStock = product.countInStock + direction * item.quantity;

      if (nextStock < 0) {
        throw new AppError(
          400,
          `Tồn kho sản phẩm ${item.name} không đủ để tạo đơn hàng.`
        );
      }

      product.countInStock = nextStock;
      await product.save();
    }
  }
};

const incrementVoucherUsage = async (voucherCode, userId) => {
  if (!voucherCode) {
    return;
  }

  const voucher = await Voucher.findOne({ code: voucherCode });

  if (!voucher) {
    return;
  }

  voucher.usedCount += 1;

  if (userId) {
    const userUsage = voucher.usageByUser.find(
      (item) => String(item.user) === String(userId)
    );

    if (userUsage) {
      userUsage.count += 1;
    } else {
      voucher.usageByUser.push({ user: userId, count: 1 });
    }
  }

  await voucher.save();
};

const rollbackVoucherUsage = async (voucherCode, userId) => {
  if (!voucherCode) {
    return;
  }

  const voucher = await Voucher.findOne({ code: voucherCode });

  if (!voucher) {
    return;
  }

  voucher.usedCount = Math.max(voucher.usedCount - 1, 0);

  if (userId) {
    const userUsage = voucher.usageByUser.find(
      (item) => String(item.user) === String(userId)
    );

    if (userUsage) {
      userUsage.count = Math.max(userUsage.count - 1, 0);
    }
  }

  await voucher.save();
};

const resolveShippingAddress = async (req) => {
  if (req.user && req.body.addressId) {
    const address = await Address.findOne({
      _id: req.body.addressId,
      user: req.user._id,
    });

    if (!address) {
      throw new AppError(404, 'Không tìm thấy địa chỉ giao hàng đã chọn.');
    }

    return {
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      street: address.street,
      note: address.note,
    };
  }

  const shippingAddress = req.body.shippingAddress || {};
  const requiredFields = [
    'recipientName',
    'phone',
    'province',
    'district',
    'ward',
    'street',
  ];

  const missingFields = requiredFields.filter((field) => !shippingAddress[field]);

  if (missingFields.length > 0) {
    throw new AppError(
      400,
      `Thiếu thông tin giao hàng: ${missingFields.join(', ')}.`
    );
  }

  return shippingAddress;
};

const attachVoucherToCart = async (cart, code, userId) => {
  const voucher = await Voucher.findOne({ code: code.toUpperCase() });

  if (!voucher || !isVoucherActive(voucher)) {
    throw new AppError(400, 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
  }

  if (userId && voucher.usageLimitPerUser > 0) {
    const usage = voucher.usageByUser.find(
      (item) => String(item.user) === String(userId)
    );

    if ((usage?.count || 0) >= voucher.usageLimitPerUser) {
      throw new AppError(400, 'Bạn đã dùng hết lượt của mã giảm giá này.');
    }
  }

  const result = calculateVoucherDiscount(voucher, cart.subtotal);

  if (!result.isValid) {
    throw new AppError(400, result.message);
  }

  cart.voucherCode = voucher.code;
  cart.voucherSnapshot = {
    code: voucher.code,
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    maxDiscount: voucher.maxDiscount,
    minOrderValue: voucher.minOrderValue,
  };

  recalculateCart(cart);
};

export const createOrder = asyncHandler(async (req, res) => {
  const owner = getRequestOwner(req, { allowGuest: true });
  const ownerQuery = buildOwnerQuery(owner);
  const cart = await Cart.findOne(ownerQuery);

  if (!cart || cart.items.length === 0) {
    throw new AppError(400, 'Giỏ hàng đang trống, chưa thể tạo đơn.');
  }

  await syncCartItemsWithInventory(cart);

  if (cart.voucherCode) {
    await attachVoucherToCart(cart, cart.voucherCode, req.user?._id);
  }

  if (
    req.body.voucherCode &&
    req.body.voucherCode.toUpperCase() !== (cart.voucherCode || '')
  ) {
    await attachVoucherToCart(cart, req.body.voucherCode, req.user?._id);
  }

  const shippingAddress = await resolveShippingAddress(req);
  const shippingFee = Math.max(Number(req.body.shippingFee) || 0, 0);
  const paymentMethod = req.body.paymentMethod || 'COD';

  const customerInfo = {
    fullName:
      req.body.customerInfo?.fullName ||
      req.user?.fullName ||
      shippingAddress.recipientName,
    email: req.body.customerInfo?.email || req.user?.email || '',
    phone:
      req.body.customerInfo?.phone ||
      req.user?.phone ||
      shippingAddress.phone,
  };

  const order = await Order.create({
    ...ownerQuery,
    customerInfo,
    shippingAddress,
    items: cart.items.map((item) => ({
      product: item.product,
      variant: item.variant || null,
      name: item.name,
      image: item.image,
      selectedColor: item.selectedColor,
      selectedStorage: item.selectedStorage,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    subtotal: cart.subtotal,
    discountTotal: cart.discountTotal,
    shippingFee,
    total: cart.total + shippingFee,
    voucherCode: cart.voucherCode,
    voucherSnapshot: cart.voucherSnapshot
      ? {
          ...cart.voucherSnapshot,
          discountAmount: cart.discountTotal,
        }
      : undefined,
    paymentMethod,
    paymentStatus: 'pending',
    status: 'pending',
    timeline: [
      createTimelineEntry(
        'pending',
        'Đơn hàng đã được tạo',
        'Hệ thống đã ghi nhận đơn hàng và đang chờ thanh toán/xác nhận.'
      ),
    ],
    notes: req.body.notes || '',
  });

  await adjustInventory(order.items, -1);
  await incrementVoucherUsage(order.voucherCode, req.user?._id);

  cart.items = [];
  cart.voucherCode = '';
  cart.voucherSnapshot = undefined;
  recalculateCart(cart);
  await cart.save();

  res.status(201).json({
    message: 'Tạo đơn hàng thành công.',
    order: await hydrateOrder({ _id: order._id }),
  });
});

export const processPayment = asyncHandler(async (req, res) => {
  if (!req.body.orderId) {
    throw new AppError(400, 'Vui lòng cung cấp orderId để thanh toán.');
  }

  const owner = getRequestOwner(req, { allowGuest: true });
  const order = await hydrateOrder({
    _id: req.body.orderId,
    ...buildOwnerQuery(owner),
  });

  if (!order) {
    throw new AppError(404, 'Không tìm thấy đơn hàng cần thanh toán.');
  }

  if (order.status === 'cancelled') {
    throw new AppError(400, 'Đơn hàng đã bị hủy, không thể thanh toán.');
  }

  const method = req.body.method || order.paymentMethod;
  const simulateSuccess = req.body.simulateSuccess !== false;

  const payment = await Payment.create({
    order: order._id,
    user: order.user?._id,
    method,
    amount: order.total,
    status:
      method === 'COD' ? 'pending' : simulateSuccess ? 'paid' : 'failed',
    providerTransactionId: req.body.providerTransactionId || '',
    providerResponse: req.body.providerResponse || {},
    paidAt:
      method !== 'COD' && simulateSuccess ? new Date() : undefined,
  });

  if (method === 'COD') {
    order.status = 'confirmed';
    order.paymentStatus = 'pending';
    order.timeline.push(
      createTimelineEntry(
        'confirmed',
        'Đơn chờ giao và thu tiền COD',
        'Khách hàng thanh toán khi nhận hàng.'
      )
    );
  } else if (simulateSuccess) {
    order.status = 'confirmed';
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.timeline.push(
      createTimelineEntry(
        'confirmed',
        'Thanh toán thành công',
        `Thanh toán qua ${method} đã được xác nhận.`
      )
    );
  } else {
    order.paymentStatus = 'failed';
    order.timeline.push(
      createTimelineEntry(
        'pending',
        'Thanh toán thất bại',
        `Thanh toán qua ${method} chưa thành công.`
      )
    );
  }

  order.paymentMethod = method;
  await order.save();

  res.json({
    message: 'Xử lý thanh toán thành công.',
    payment,
    order,
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const owner = getRequestOwner(req, { allowGuest: true });
  const order = await hydrateOrder({
    _id: req.params.id,
    ...buildOwnerQuery(owner),
  });

  if (!order) {
    throw new AppError(404, 'Không tìm thấy đơn hàng.');
  }

  res.json({ order });
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name slug image')
    .populate('items.variant', 'color storage image');

  res.json({
    data: orders,
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const owner = getRequestOwner(req, { allowGuest: true });
  const order = await Order.findOne({
    _id: req.params.id,
    ...buildOwnerQuery(owner),
  });

  if (!order) {
    throw new AppError(404, 'Không tìm thấy đơn hàng để hủy.');
  }

  if (['delivered', 'cancelled'].includes(order.status)) {
    throw new AppError(
      400,
      'Đơn hàng ở trạng thái hiện tại không thể hủy được nữa.'
    );
  }

  order.status = 'cancelled';
  order.cancelReason = req.body.reason || 'Khách hàng thay đổi nhu cầu.';
  order.paymentStatus =
    order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus;
  order.timeline.push(
    createTimelineEntry(
      'cancelled',
      'Đơn hàng đã bị hủy',
      order.cancelReason
    )
  );

  await order.save();
  await adjustInventory(order.items, 1);
  await rollbackVoucherUsage(order.voucherCode, order.user);

  res.json({
    message: 'Hủy đơn hàng thành công.',
    order: await hydrateOrder({ _id: order._id }),
  });
});
