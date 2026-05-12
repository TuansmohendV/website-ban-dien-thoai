import mongoose from 'mongoose';
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
import { sendOrderConfirmationEmail, sendOrderStatusEmail, sendDeliveredInvoiceEmail } from '../utils/email.js';
import { createVNPayUrl, verifyVNPayReturn } from '../utils/vnpay.js';

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

const resolveDirectOrderItem = async ({ productId, variantId, quantity }) => {
  if (!productId || quantity < 1) {
    throw new AppError(400, 'Sản phẩm mua ngay không hợp lệ.');
  }

  const product = await Product.findById(productId);

  if (!product || product.status !== 'active') {
    throw new AppError(404, 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.');
  }

  let variant = null;
  let availableStock = product.countInStock;
  let unitPrice = product.price;
  let image = product.image;
  let selectedColor = '';
  let selectedStorage = product.storage || '';

  if (variantId) {
    variant = await ProductVariant.findById(variantId);

    if (
      !variant ||
      String(variant.product) !== String(product._id) ||
      !variant.isActive
    ) {
      throw new AppError(404, 'Biến thể sản phẩm không hợp lệ.');
    }

    availableStock = variant.stock;
    unitPrice = variant.price;
    image = variant.image || product.image;
    selectedColor = variant.color || '';
    selectedStorage = variant.storage || product.storage || '';
  }

  if (quantity > availableStock) {
    throw new AppError(400, `Sản phẩm ${product.name} không đủ hàng trong kho.`);
  }

  return {
    product: product._id,
    variant: variant?._id || null,
    name: product.name,
    image,
    selectedColor,
    selectedStorage,
    unitPrice,
    quantity,
    lineTotal: unitPrice * quantity,
    maxStock: availableStock,
  };
};

const buildDraftCartFromItems = async (items = []) => {
  const draftCart = {
    items: [],
    voucherCode: '',
    voucherSnapshot: undefined,
    subtotal: 0,
    discountTotal: 0,
    total: 0,
  };

  for (const item of items) {
    const quantity = Number(item.quantity) || 1;
    const nextItem = await resolveDirectOrderItem({
      productId: item.productId,
      variantId: item.variantId,
      quantity,
    });

    draftCart.items.push(nextItem);
  }

  recalculateCart(draftCart);
  return draftCart;
};

const checkInventory = async (items) => {
  for (const item of items) {
    if (item.variant) {
      const variant = await ProductVariant.findById(item.variant);
      if (!variant) continue;
      if (variant.stock < item.quantity) {
        throw new AppError(
          400,
          `Rất tiếc, biến thể ${item.selectedColor} ${item.selectedStorage} của sản phẩm ${item.name} đã hết hàng hoặc không đủ số lượng.`
        );
      }
    } else {
      const product = await Product.findById(item.product);
      if (!product) continue;
      if (product.countInStock < item.quantity) {
        throw new AppError(
          400,
          `Rất tiếc, sản phẩm ${item.name} đã hết hàng hoặc số lượng tồn kho không đủ. Vui lòng chọn sản phẩm khác.`
        );
      }
    }
  }
};

const adjustInventoryAtomic = async (items, direction, session, io) => {
  for (const item of items) {
    let updated;
    const quantityChange = direction * item.quantity;

    if (item.variant) {
      // Atomic decrement with condition to prevent negative stock
      updated = await ProductVariant.findOneAndUpdate(
        {
          _id: item.variant,
          stock: { $gte: direction === -1 ? item.quantity : 0 }
        },
        { $inc: { stock: quantityChange } },
        { session, new: true }
      );

      if (!updated && direction === -1) {
        throw new AppError(
          400,
          `Rất tiếc, sản phẩm ${item.name} (màu ${item.selectedColor}) vừa mới hết hàng. Vui lòng cập nhật lại giỏ hàng.`
        );
      }
      
      // Emit real-time stock update
      if (io && updated) {
        io.emit('stock_update', {
          productId: item.product,
          variantId: item.variant,
          newStock: updated.stock
        });
      }
    } else {
      updated = await Product.findOneAndUpdate(
        {
          _id: item.product,
          countInStock: { $gte: direction === -1 ? item.quantity : 0 }
        },
        { $inc: { countInStock: quantityChange } },
        { session, new: true }
      );

      if (!updated && direction === -1) {
        throw new AppError(
          400,
          `Rất tiếc, sản phẩm ${item.name} vừa mới hết hàng. Vui lòng chọn sản phẩm khác.`
        );
      }

      // Emit real-time stock update
      if (io && updated) {
        io.emit('stock_update', {
          productId: item.product,
          newStock: updated.countInStock
        });
      }
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const owner = getRequestOwner(req, { allowGuest: true });
    const ownerQuery = buildOwnerQuery(owner);
    const hasDirectItems =
      Array.isArray(req.body.items) && req.body.items.length > 0;
    const cart = hasDirectItems ? null : await Cart.findOne(ownerQuery).session(session);
    const sourceCart = hasDirectItems
      ? await buildDraftCartFromItems(req.body.items)
      : cart;

    if (!sourceCart || sourceCart.items.length === 0) {
      throw new AppError(400, 'Giỏ hàng đang trống, chưa thể tạo đơn.');
    }

    if (!hasDirectItems) {
      await syncCartItemsWithInventory(sourceCart);
    }

    if (sourceCart.voucherCode) {
      await attachVoucherToCart(sourceCart, sourceCart.voucherCode, req.user?._id);
    }

    if (
      req.body.voucherCode &&
      req.body.voucherCode.toUpperCase() !== (sourceCart.voucherCode || '')
    ) {
      await attachVoucherToCart(sourceCart, req.body.voucherCode, req.user?._id);
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
    const invoiceInput = req.body.invoiceInfo || {};
    const hasInvoiceRequest = Boolean(invoiceInput.enabled);
    let invoiceInfo = undefined;

    if (hasInvoiceRequest) {
      const invoiceEmail = invoiceInput.email || customerInfo.email || '';
      const missingInvoiceFields = [
        ['email', invoiceEmail],
        ['companyName', invoiceInput.companyName],
        ['taxCode', invoiceInput.taxCode],
        ['companyAddress', invoiceInput.companyAddress],
      ]
        .filter(([, value]) => !String(value || '').trim())
        .map(([field]) => field);

      if (missingInvoiceFields.length > 0) {
        throw new AppError(
          400,
          `Thiếu thông tin xuất hóa đơn: ${missingInvoiceFields.join(', ')}.`
        );
      }

      invoiceInfo = {
        enabled: true,
        email: String(invoiceEmail).trim(),
        companyName: String(invoiceInput.companyName).trim(),
        taxCode: String(invoiceInput.taxCode).trim(),
        companyAddress: String(invoiceInput.companyAddress).trim(),
      };
    }

    // Real-time stock check before order creation
    await checkInventory(sourceCart.items);

    const [order] = await Order.create([{
      ...ownerQuery,
      customerInfo,
      invoiceInfo,
      shippingAddress,
      items: sourceCart.items.map((item) => ({
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
      subtotal: sourceCart.subtotal,
      discountTotal: sourceCart.discountTotal,
      shippingFee,
      total: sourceCart.total + shippingFee,
      voucherCode: sourceCart.voucherCode,
      voucherSnapshot: sourceCart.voucherSnapshot
        ? {
          ...sourceCart.voucherSnapshot,
          discountAmount: sourceCart.discountTotal,
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
    }], { session });

    // Atomic inventory reduction (This is the "Queue" logic - whoever updates successfully first gets it)
    await adjustInventoryAtomic(order.items, -1, session, req.io);
    
    // Process voucher usage
    if (order.voucherCode) {
      const voucher = await Voucher.findOne({ code: order.voucherCode }).session(session);
      if (voucher) {
        voucher.usedCount += 1;
        if (req.user?._id) {
          const userUsage = voucher.usageByUser.find(u => String(u.user) === String(req.user._id));
          if (userUsage) userUsage.count += 1;
          else voucher.usageByUser.push({ user: req.user._id, count: 1 });
        }
        await voucher.save({ session });
      }
    }

    if (!hasDirectItems && cart) {
      cart.items = [];
      cart.voucherCode = '';
      cart.voucherSnapshot = undefined;
      recalculateCart(cart);
      await cart.save({ session });
    }

    await session.commitTransaction();

    const hydratedOrder = await hydrateOrder({ _id: order._id });

    // Send confirmation email in background
    if (customerInfo.email) {
      const websiteUrl = `${req.protocol}://${req.get('host')}`;
      sendOrderConfirmationEmail({
        to: customerInfo.email,
        order: hydratedOrder,
        websiteUrl
      }).catch(err => console.error('Failed to send order email:', err));
    }

    res.status(201).json({
      message: 'Tạo đơn hàng thành công.',
      order: hydratedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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

  // Real API Integration Mock for Payment Gateways
  const returnUrl = req.body.returnUrl || `${req.protocol}://${req.get('host')}/checkout-result`;
  const mockUrl = `${req.body.origin || `${req.protocol}://${req.get('host')}`}/mock-payment`;
  let paymentUrl = '';

  if (method === 'vnpay') {
    if (process.env.VNP_TMN_CODE) {
      paymentUrl = createVNPayUrl(req, order.total, order._id, returnUrl);
    } else {
      const vnp_TxnRef = `${order._id}_${Date.now()}`;
      const vnp_Amount = order.total * 100;
      paymentUrl = `${returnUrl}?orderId=${order._id}&method=vnpay&vnp_ResponseCode=00&vnp_TxnRef=${vnp_TxnRef}&vnp_Amount=${vnp_Amount}`;
    }
  } else if (method === 'MOMO' || method === 'momo_sub' || method === 'zalopay' || method === 'BANK_TRANSFER' || method === 'bank') {
    // Redirect to Mock Payment Gateway for better interaction
    const requestId = `${order._id}_${Date.now()}`;
    paymentUrl = `${mockUrl}?orderId=${order._id}&method=${method}&amount=${order.total}&returnUrl=${encodeURIComponent(returnUrl)}&requestId=${requestId}`;
  } else if (method === 'COD') {
    paymentUrl = `${returnUrl}?orderId=${order._id}&method=COD&success=true`;
  } else {
    paymentUrl = `${returnUrl}?orderId=${order._id}&method=${method}&success=true`;
  }

  res.json({
    message: 'Tạo URL thanh toán thành công.',
    paymentUrl,
    orderId: order._id
  });
});

export const paymentCallback = asyncHandler(async (req, res) => {
  const { orderId, method, vnp_ResponseCode, resultCode, success, vnp_TxnRef, requestId } = req.body;

  if (!orderId) {
    throw new AppError(400, 'Mã đơn hàng không hợp lệ.');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(404, 'Không tìm thấy đơn hàng cần thanh toán.');
  }

  if (order.status === 'cancelled') {
    throw new AppError(400, 'Đơn hàng đã bị hủy.');
  }

  // Verify payment status
  let isSuccess = false;
  const m = String(method || '').toLowerCase();

  if (m === 'vnpay') {
    // Check signature if it comes from real VNPay Gateway
    if (req.body.vnp_SecureHash && process.env.VNP_HASH_SECRET) {
      isSuccess = verifyVNPayReturn(req.body) && vnp_ResponseCode === '00';
    } else {
      isSuccess = vnp_ResponseCode === '00' || String(success) === 'true'; // fallback mock
    }
  }
  else if (m === 'momo' || m === 'momo_sub' || m === 'zalopay') {
    // Check both resultCode (standard) and success flag (mock fallback)
    isSuccess = String(resultCode) === '0' || String(success) === 'true';
  }
  else if (m === 'cod' || m === 'bank' || m === 'bank_transfer') isSuccess = String(success) === 'true';
  else isSuccess = true;

  const payment = await Payment.create({
    order: order._id,
    user: order.user?._id,
    method,
    amount: order.total,
    status: method === 'COD' ? 'pending' : isSuccess ? 'paid' : 'failed',
    providerTransactionId: req.body.transactionId || vnp_TxnRef || requestId || '',
    paidAt: method !== 'COD' && isSuccess ? new Date() : undefined,
  });

  const now = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  const getMethodDetail = (m) => {
    const map = {
      'vnpay': 'Cổng thanh toán VNPay',
      'momo': 'Ví điện tử MoMo',
      'momo_sub': 'Ví điện tử MoMo',
      'zalopay': 'Ví điện tử ZaloPay',
      'bank': 'Chuyển khoản Ngân hàng',
      'BANK_TRANSFER': 'Chuyển khoản Ngân hàng',
      'COD': 'Thanh toán khi nhận hàng (COD)'
    };
    return map[m] || m;
  };

  if (method === 'COD') {
    if (order.status !== 'confirmed') {
      order.status = 'confirmed';
      order.paymentStatus = 'pending';
      order.timeline.push(createTimelineEntry('confirmed', 'Đơn chờ giao và thu tiền COD', `Hệ thống ghi nhận hình thức COD vào lúc ${timeStr} ngày ${dateStr}. Khách hàng sẽ thanh toán khi nhận hàng.`));
    }
  } else if (isSuccess) {
    if (order.paymentStatus !== 'paid') {
      order.status = 'confirmed';
      order.paymentStatus = 'paid';
      order.paidAt = now;
      
      const detailMsg = `Thanh toán qua ${getMethodDetail(method)} thành công vào lúc ${timeStr} ngày ${dateStr}. Số tiền: ${order.total.toLocaleString('vi-VN')}đ.`;
      order.timeline.push(createTimelineEntry('confirmed', 'Thanh toán thành công', detailMsg));

      // Send invoice email immediately for successful online payment
      if (order.customerInfo?.email) {
          const websiteUrl = `${req.protocol}://${req.get('host')}`;
          sendDeliveredInvoiceEmail({
              to: order.customerInfo.email,
              order: await hydrateOrder({ _id: order._id }),
              websiteUrl
          }).catch(err => console.error('Failed to send invoice email after payment:', err));
      }
    }
  } else {
    if (order.paymentStatus !== 'failed') {
      order.paymentStatus = 'failed';
      order.timeline.push(createTimelineEntry('pending', 'Thanh toán thất bại', `Giao dịch qua ${getMethodDetail(method)} không thành công vào lúc ${timeStr} ngày ${dateStr}.`));
    }
  }

  order.paymentMethod = method;
  await order.save();

  res.json({
    message: 'Cập nhật trạng thái thanh toán thành công.',
    payment,
    order: await hydrateOrder({ _id: order._id }),
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
  const { year } = req.query;
  const query = { user: req.user._id };

  if (year) {
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
    query.createdAt = { $gte: startOfYear, $lte: endOfYear };
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate('items.product', 'name slug image')
    .populate('items.variant', 'color storage image');

  res.json({
    data: orders,
  });
});

export const getUserOrderYears = asyncHandler(async (req, res) => {
  const years = await Order.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: { $year: '$createdAt' },
        count: { $sum: 1 },
        totalSpent: { $sum: '$total' }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  res.json({
    data: years.map(y => ({
      year: y._id,
      count: y.count,
      totalSpent: y.totalSpent
    }))
  });
});

export const getAdminOrders = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.user) {
    query.user = req.query.user;
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate('items.product', 'name slug image')
    .populate('items.variant', 'color storage image')
    .populate('user', 'fullName email phone');

  res.json({
    data: orders,
  });
});

export const updateAdminOrderStatus = asyncHandler(async (req, res) => {
  const allowedStatuses = ['pending', 'confirmed', 'processing', 'packing', 'shipping', 'delivered', 'cancelled'];
  const nextStatus = req.body.status;

  if (!allowedStatuses.includes(nextStatus)) {
    throw new AppError(400, 'Trạng thái đơn hàng không hợp lệ.');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError(404, 'Không tìm thấy đơn hàng.');
  }

  order.status = nextStatus;

  if (nextStatus === 'delivered' && order.paymentMethod === 'COD') {
    order.paymentStatus = 'paid';
    order.paidAt = order.paidAt || new Date();
  }

  if (nextStatus === 'cancelled') {
    order.paymentStatus =
      order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus;
    // Return inventory
    await adjustInventoryAtomic(order.items, 1, null, req.io);
    await rollbackVoucherUsage(order.voucherCode, order.user);
  }

  order.timeline.push(
    createTimelineEntry(
      nextStatus,
      'Admin cập nhật trạng thái',
      req.body.note || `Đơn hàng được chuyển sang trạng thái ${nextStatus}.`
    )
  );

  await order.save();

  const hydratedOrderForClient = await hydrateOrder({ _id: order._id });

  if (order.customerInfo?.email) {
    const websiteUrl = `${req.protocol}://${req.get('host')}`;

    // Khi đơn COD được giao: gửi email hóa đơn chuyên biệt
    if (nextStatus === 'delivered' && order.paymentMethod === 'COD') {
      sendDeliveredInvoiceEmail({
        to: order.customerInfo.email,
        order: hydratedOrderForClient,
        websiteUrl,
      }).catch(err => console.error('Failed to send invoice email:', err));
    } else {
      // Các trạng thái khác: gửi email cập nhật trạng thái thông thường
      sendOrderStatusEmail({
        to: order.customerInfo.email,
        order: hydratedOrderForClient,
        websiteUrl,
      }).catch(err => console.error('Failed to send status email:', err));
    }
  }

  res.json({
    message: 'Cập nhật trạng thái đơn hàng thành công.',
    order: hydratedOrderForClient,
  });
});

export const resendInvoiceEmail = asyncHandler(async (req, res) => {
  const order = await hydrateOrder({ _id: req.params.id });
  if (!order) {
    throw new AppError(404, 'Không tìm thấy đơn hàng.');
  }

  if (!order.customerInfo?.email) {
    throw new AppError(400, 'Đơn hàng này không có email khách hàng.');
  }

  const websiteUrl = `${req.protocol}://${req.get('host')}`;
  await sendDeliveredInvoiceEmail({
    to: order.customerInfo.email,
    order,
    websiteUrl
  });

  res.json({ message: 'Đã gửi lại email hóa đơn thành công.' });
});

export const getAdminOrderDetail = asyncHandler(async (req, res) => {
  const order = await hydrateOrder({ _id: req.params.id });

  if (!order) {
    throw new AppError(404, 'Không tìm thấy đơn hàng.');
  }

  res.json({ order });
});

export const updateAdminOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError(404, 'Không tìm thấy đơn hàng.');
  }

  const allowedStatuses = ['pending', 'confirmed', 'processing', 'packing', 'shipping', 'delivered', 'cancelled'];

  if (req.body.status && allowedStatuses.includes(req.body.status)) {
    order.status = req.body.status;

    if (req.body.status === 'delivered' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'paid';
      order.paidAt = order.paidAt || new Date();
    }

    if (req.body.status === 'cancelled') {
      order.paymentStatus =
        order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus;
      // Return inventory
      await adjustInventoryAtomic(order.items, 1, null, req.io);
      await rollbackVoucherUsage(order.voucherCode, order.user);
    }
  }

  if (req.body.paymentStatus) {
    order.paymentStatus = req.body.paymentStatus;
    if (req.body.paymentStatus === 'paid') {
      order.paidAt = order.paidAt || new Date();
    }
  }

  if (req.body.notes !== undefined) {
    order.notes = req.body.notes;
  }

  const timelineMsg = req.body.timelineMessage || req.body.note || 'Admin cập nhật đơn hàng';
  order.timeline.push(
    createTimelineEntry(
      order.status,
      timelineMsg,
      req.body.paymentNote || `Đơn hàng được cập nhật bởi admin.`
    )
  );

  await order.save();

  const hydratedOrderForClient = await hydrateOrder({ _id: order._id });

  if (req.body.status && order.customerInfo?.email) {
    const websiteUrl = `${req.protocol}://${req.get('host')}`;
    sendOrderStatusEmail({
      to: order.customerInfo.email,
      order: hydratedOrderForClient,
      websiteUrl
    }).catch(err => console.error('Failed to send status email:', err));
  }

  res.json({
    message: 'Cập nhật đơn hàng thành công.',
    order: hydratedOrderForClient,
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
  await adjustInventoryAtomic(order.items, 1, null, req.io);
  await rollbackVoucherUsage(order.voucherCode, order.user);

  res.json({
    message: 'Hủy đơn hàng thành công.',
    order: await hydrateOrder({ _id: order._id }),
  });
});
