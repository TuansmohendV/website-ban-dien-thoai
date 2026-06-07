const STATUS_FLOW = ['pending', 'processing', 'shipping', 'delivered'];

const STATUS_LABELS = {
  pending: 'Don hang da duoc tao',
  processing: 'Don hang dang duoc xu ly',
  shipping: 'Don hang dang giao toi ban',
  delivered: 'Don hang da giao thanh cong',
  cancelled: 'Don hang da bi huy',
};

const PAYMENT_LABELS = {
  COD: 'Thanh toan khi nhan hang',
  BANK_TRANSFER: 'Chuyen khoan ngan hang',
  MOMO: 'Vi MoMo',
  VNPAY: 'VNPay',
  CARD: 'Thanh toan bang the',
};

export const normalizeOrderStatus = (status = '') => {
  switch (status) {
    case 'confirmed':
    case 'packing':
    case 'processing':
      return 'processing';
    case 'shipping':
      return 'shipping';
    case 'delivered':
      return 'delivered';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
};

export const mapPaymentMethodToBackend = (paymentMethod, subMethod = '') => {
  if (paymentMethod === 'bank') {
    return 'BANK_TRANSFER';
  }

  if (paymentMethod === 'momo') {
    return subMethod === 'vnpay' ? 'VNPAY' : 'MOMO';
  }

  if (paymentMethod === 'card') {
    return 'CARD';
  }

  return 'COD';
};

export const mapPaymentMethodToFrontend = (paymentMethod = '') => {
  switch (paymentMethod) {
    case 'BANK_TRANSFER':
      return 'bank';
    case 'MOMO':
    case 'VNPAY':
      return 'momo';
    case 'CARD':
      return 'card';
    default:
      return 'cod';
  }
};

export const getPaymentMethodLabel = (paymentMethod = '') =>
  PAYMENT_LABELS[paymentMethod] || PAYMENT_LABELS.COD;

const formatDateTime = (value) => {
  if (!value) {
    return '';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleString('vi-VN');
};

const buildAddressLabel = (shippingAddress = {}, fallbackAddress = '') => {
  const parts = [
    shippingAddress.street,
    shippingAddress.ward,
    shippingAddress.district,
    shippingAddress.province,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : fallbackAddress;
};

const buildEstimatedDelivery = (createdAt, shippingAddress = {}) => {
  if (!createdAt) {
    return '';
  }

  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  const province = String(shippingAddress.province || '').toLowerCase();
  const addressStr = String(shippingAddress.address || '').toLowerCase();
  
  let daysToAdd = 3;

  // Near regions (1-2 days)
  if (/(ha noi|hanoi|h\.n|tp hcm|ho chi minh|hcm|sai gon|saigon)/.test(province) || 
      /(ha noi|hanoi|h\.n|tp hcm|ho chi minh|hcm|sai gon|saigon)/.test(addressStr)) {
    daysToAdd = 1;
  } else if (/(da nang|danang|binh duong|dong nai|long an|hai phong|bac ninh)/.test(province) ||
             /(da nang|danang|binh duong|dong nai|long an|hai phong|bac ninh)/.test(addressStr)) {
    daysToAdd = 2;
  }

  parsedDate.setDate(parsedDate.getDate() + daysToAdd);

  return parsedDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const buildFallbackTimeline = (status, createdAt, updatedAt = '') => {
  const normalizedStatus = normalizeOrderStatus(status);
  const createdAtLabel = formatDateTime(createdAt);
  const updatedAtLabel = formatDateTime(updatedAt);

  if (normalizedStatus === 'cancelled') {
    return [
      {
        status: 'pending',
        text: STATUS_LABELS.pending,
        description: '',
        time: createdAtLabel,
        active: true,
      },
      {
        status: 'cancelled',
        text: STATUS_LABELS.cancelled,
        description: '',
        time: updatedAtLabel || createdAtLabel,
        active: true,
      },
    ];
  }

  const currentIndex = Math.max(STATUS_FLOW.indexOf(normalizedStatus), 0);

  return STATUS_FLOW.map((stepStatus, index) => ({
    status: stepStatus,
    text: STATUS_LABELS[stepStatus],
    description: '',
    time:
      index === 0
        ? createdAtLabel
        : index === currentIndex
          ? updatedAtLabel || createdAtLabel
          : '',
    active: index <= currentIndex,
  }));
};

const normalizeTimeline = (order = {}, normalizedStatus = 'pending') => {
  const source = Array.isArray(order.timeline) ? order.timeline : [];

  if (source.length === 0) {
    return buildFallbackTimeline(
      normalizedStatus,
      order.createdAt || order.placedAt || order.date,
      order.updatedAt
    );
  }

  return source.map((entry, index) => ({
    status: normalizeOrderStatus(entry.status || normalizedStatus),
    text:
      entry.label ||
      entry.text ||
      STATUS_LABELS[normalizeOrderStatus(entry.status || normalizedStatus)],
    description: entry.message || entry.description || '',
    time: formatDateTime(entry.createdAt || entry.time || order.createdAt),
    active:
      typeof entry.active === 'boolean'
        ? entry.active
        : normalizeOrderStatus(entry.status || normalizedStatus) ===
            normalizedStatus || index === 0,
  }));
};

export const normalizeOrder = (order = {}) => {
  const orderId = order._id || order.id || order.orderId || '';
  const createdAt =
    order.createdAt || order.placedAt || order.date || new Date().toISOString();
  const normalizedStatus = normalizeOrderStatus(order.status);
  const customerName =
    order.customerInfo?.fullName ||
    order.customerInfo?.name ||
    order.customer?.fullName ||
    order.customer?.name ||
    'Khach vang lai';
  const customerPhone =
    order.customerInfo?.phone ||
    order.customer?.phone ||
    order.customer?.phoneNumber ||
    '';
  const customerEmail =
    order.customerInfo?.email || order.customer?.email || '';
  const rawInvoiceInfo = order.invoiceInfo || order.vatInfo || null;
  const hasVatInfo = Boolean(
    rawInvoiceInfo?.enabled ||
      rawInvoiceInfo?.companyName ||
      rawInvoiceInfo?.taxCode ||
      rawInvoiceInfo?.companyAddress
  );
  const addressLabel = buildAddressLabel(
    order.shippingAddress,
    order.customerInfo?.address || order.customer?.address || ''
  );
  const rawItems = Array.isArray(order.items) ? order.items : [];
  const items = rawItems.map((item, index) => {
    const quantity = Number(item.quantity ?? item.qty ?? 1);
    const price = Number(item.unitPrice ?? item.price ?? 0);

    return {
      ...item,
      id: item._id || item.id || `${orderId}-item-${index}`,
      name: item.name || item.product?.name || 'San pham',
      qty: quantity,
      quantity,
      price,
      unitPrice: price,
      image: item.image || item.product?.image || '',
      total: Number(item.lineTotal || price * quantity),
    };
  });
  const subtotal =
    Number(order.subtotal ?? order.summary?.subtotal) ||
    items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping =
    Number(order.shippingFee ?? order.shipping ?? order.summary?.shipping) || 0;
  const discount =
    Number(order.discountTotal ?? order.discount ?? order.summary?.discount) ||
    0;
  const totalAmount =
    Number(order.totalAmount ?? order.total) ||
    Math.max(subtotal + shipping - discount, 0);
  const backendPaymentMethod = order.paymentMethod || order.payment?.backendMethod || 'COD';
  const timeline = normalizeTimeline(order, normalizedStatus);

  return {
    ...order,
    id: orderId,
    orderId: orderId,
    backendId: order._id || order.id || order.orderId || '',
    date: formatDateTime(createdAt),
    createdAt,
    updatedAt: order.updatedAt || '',
    status: normalizedStatus,
    items,
    subtotal,
    shipping,
    shippingFee: shipping,
    discount,
    discountTotal: discount,
    total: totalAmount,
    totalAmount,
    customerInfo: {
      name: customerName,
      fullName: customerName,
      phone: customerPhone,
      email: customerEmail,
      address: addressLabel,
    },
    customer: {
      fullName: customerName,
      phone: customerPhone,
      email: customerEmail,
      address: addressLabel,
      city: order.shippingAddress?.province || '',
    },
    vatInfo: hasVatInfo
      ? {
          enabled: true,
          email: rawInvoiceInfo?.email || customerEmail,
          companyName: rawInvoiceInfo?.companyName || '',
          taxCode: rawInvoiceInfo?.taxCode || '',
          companyAddress: rawInvoiceInfo?.companyAddress || '',
        }
      : null,
    invoiceInfo: hasVatInfo
      ? {
          enabled: true,
          email: rawInvoiceInfo?.email || customerEmail,
          companyName: rawInvoiceInfo?.companyName || '',
          taxCode: rawInvoiceInfo?.taxCode || '',
          companyAddress: rawInvoiceInfo?.companyAddress || '',
        }
      : null,
    shippingAddress: order.shippingAddress || null,
    paymentMethod: backendPaymentMethod,
    paymentStatus: order.paymentStatus || order.payment?.status || 'pending',
    payment: {
      method: mapPaymentMethodToFrontend(backendPaymentMethod),
      backendMethod: backendPaymentMethod,
      methodLabel:
        order.payment?.methodLabel || getPaymentMethodLabel(backendPaymentMethod),
      status: order.paymentStatus || order.payment?.status || 'pending',
    },
    summary: {
      subtotal,
      shipping,
      discount,
    },
    estimatedDelivery:
      order.estimatedDelivery ||
      buildEstimatedDelivery(createdAt, { ...(order.shippingAddress || {}), address: addressLabel }),
    note: order.notes || order.note || '',
    notes: order.notes || order.note || '',
    timeline,
  };
};

export const applyLocalOrderStatus = (order = {}, nextStatus) =>
  normalizeOrder({
    ...order,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  });
