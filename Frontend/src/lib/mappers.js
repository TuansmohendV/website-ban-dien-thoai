import { normalizeUser } from './session';

const ORDER_STATUS_MAP = {
  confirmed: 'processing',
  packing: 'processing',
};

const PAYMENT_METHOD_LABELS = {
  COD: 'Thanh toan khi nhan hang',
  VNPAY: 'Thanh toan qua VNPAY',
  MOMO: 'Thanh toan qua MoMo',
  CARD: 'Thanh toan bang the',
  BANK_TRANSFER: 'Chuyen khoan ngan hang',
};

const toNumber = (value, fallback = 0) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
};

const PRODUCT_SPEC_LABELS = {
  chip: 'Chip',
  os: 'He dieu hanh',
  refreshRate: 'Tan so quet',
  screen: 'Man hinh',
  battery: 'Pin',
  camera: 'Camera',
  ram: 'RAM',
  storage: 'Bo nho',
};

const formatSpecLabel = (label = '') => {
  const normalizedLabel = String(label || '').trim();

  if (!normalizedLabel) {
    return '';
  }

  if (PRODUCT_SPEC_LABELS[normalizedLabel]) {
    return PRODUCT_SPEC_LABELS[normalizedLabel];
  }

  return normalizedLabel
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const normalizeProductSpecs = (product = {}) => {
  if (Array.isArray(product.specs)) {
    return product.specs
      .filter(Boolean)
      .map((item, index) => ({
        key: item.key || item.label || `spec-${index}`,
        label: formatSpecLabel(item.label || item.key),
        value: String(item.value || '').trim(),
      }))
      .filter((item) => item.value);
  }

  const rawSpecs =
    product.specs?.specifications && typeof product.specs.specifications === 'object'
      ? product.specs.specifications
      : product.specifications && typeof product.specifications === 'object'
        ? product.specifications
        : product.specs && typeof product.specs === 'object'
          ? product.specs
          : {};

  return Object.entries(rawSpecs)
    .map(([key, value]) => ({
      key,
      label: formatSpecLabel(key),
      value: String(value || '').trim(),
    }))
    .filter((item) => item.value);
};

export const getProductRouteId = (product = {}) =>
  product.slug || product._id || product.id || '';

export const mapProductCard = (product = {}) => {
  const currentPrice = toNumber(product.minPrice ?? product.price);
  const originalPrice = toNumber(
    product.originalPrice || product.maxPrice || product.price
  );
  const discountPercent =
    originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  return {
    ...product,
    id: getProductRouteId(product),
    backendId: product._id || product.id || '',
    name: product.name || 'San pham',
    image: product.image || '',
    priceNum: currentPrice,
    oldPriceNum: originalPrice > currentPrice ? originalPrice : 0,
    discount: discountPercent > 0 ? `${discountPercent}%` : '',
    brand: product.brand || product.brandRef?.name || '',
    category: product.category || product.categoryRef?.name || '',
    specs: {
      chip: product.specifications?.chip || product.specifications?.cpu || '',
      ram: product.ram || product.specifications?.ram || '',
      screen:
        product.screen ||
        product.specifications?.screen ||
        product.specifications?.display ||
        '',
      battery: product.battery || product.specifications?.battery || '',
      camera: product.camera || product.specifications?.camera || '',
    },
    memberPrice: Math.max(currentPrice - 50000, 0),
    extraPromos: product.variantCount || product.numReviews || 0,
    availableColors: product.availableColors || product.colors || [],
    availableStorages: product.availableStorages || [],
    totalStock: toNumber(product.totalStock ?? product.countInStock),
  };
};

export const mapProductDetail = (product = {}) => {
  const mappedSummary = mapProductCard(product);
  const variants = (product.variants || []).map((variant) => ({
    ...variant,
    id: variant._id || variant.id || '',
    image: variant.image || product.image || '',
    images: variant.images?.length ? variant.images : product.images || [],
    price: toNumber(variant.price, mappedSummary.priceNum),
    stock: toNumber(variant.stock),
    color: variant.color || '',
    storage: variant.storage || '',
  }));

  const uniqueColors = new Map();

  variants.forEach((variant) => {
    if (!variant.color) {
      return;
    }

    if (!uniqueColors.has(variant.color)) {
      uniqueColors.set(variant.color, {
        id: variant.id || variant.color,
        name: variant.color,
        image: variant.image || product.image || '',
        price: variant.price || mappedSummary.priceNum,
      });
    }
  });

  (product.colors || []).forEach((color, index) => {
    if (!color || uniqueColors.has(color)) {
      return;
    }

    uniqueColors.set(color, {
      id: `${color}-${index}`,
      name: color,
      image: product.images?.[index] || product.image || '',
      price: mappedSummary.priceNum,
    });
  });

  return {
    ...mappedSummary,
    description: product.description || '',
    images:
      product.images?.length > 0
        ? product.images
        : [product.image].filter(Boolean),
    variants,
    colors: Array.from(uniqueColors.values()),
    specs: normalizeProductSpecs(product),
    rating: toNumber(product.rating),
    numReviews: toNumber(product.numReviews),
    soldCount: toNumber(product.soldCount),
    raw: product,
  };
};

export const mapSearchSuggestion = (item = {}) => {
  if (item.type === 'history') {
    return {
      type: 'history',
      keyword: item.keyword || '',
      id: item.keyword || `history-${item.lastSearchedAt || Date.now()}`,
    };
  }

  return {
    type: 'product',
    id: item.slug || item._id || item.id || '',
    name: item.name || '',
    image: item.image || '',
    priceNum: toNumber(item.price),
    brand: item.brand || '',
  };
};

export const mapCartItem = (item = {}) => {
  const productId = item.product?._id || item.product || '';
  const variantId = item.variant?._id || item.variant || '';

  return {
    id: item._id || `${productId}-${variantId || 'default'}`,
    itemId: item._id || '',
    productId,
    productSlug: item.product?.slug || productId,
    name: item.name || item.product?.name || 'San pham',
    image: item.image || item.variant?.image || item.product?.image || '',
    price: toNumber(item.unitPrice),
    oldPrice: toNumber(item.product?.originalPrice),
    qty: toNumber(item.quantity, 1),
    maxStock: toNumber(
      item.maxStock || item.variant?.stock || item.product?.countInStock
    ),
    lineTotal: toNumber(item.lineTotal),
    selectedVariant: variantId
      ? {
          id: variantId,
          storage: item.selectedStorage || item.variant?.storage || '',
          price: toNumber(item.unitPrice),
        }
      : null,
    selectedColor: item.selectedColor || item.variant?.color
      ? {
          name: item.selectedColor || item.variant?.color || 'Mac dinh',
          image: item.image || item.variant?.image || item.product?.image || '',
        }
      : null,
  };
};

export const mapCart = (cart = {}) => {
  const items = (cart.items || []).map(mapCartItem);

  return {
    ...cart,
    cartItems: items,
    items,
    subtotal: toNumber(cart.subtotal),
    discountTotal: toNumber(cart.discountTotal),
    total: toNumber(cart.total),
    totalItems: toNumber(
      cart.totalItems ?? items.reduce((sum, item) => sum + item.qty, 0)
    ),
    voucherCode: cart.voucherCode || '',
  };
};

export const formatAddress = (address = {}) =>
  [
    address.street,
    address.ward,
    address.district,
    address.province,
  ]
    .filter(Boolean)
    .join(', ');

export const mapAddress = (address = {}) => ({
  ...address,
  id: address._id || address.id || '',
  fullAddress: formatAddress(address),
});

export const mapOrder = (order = {}) => {
  const normalizedStatus = ORDER_STATUS_MAP[order.status] || order.status || 'pending';
  const timeline = (order.timeline || []).map((step) => ({
    text: step.label || step.message || step.status || 'Cap nhat don hang',
    time: step.createdAt
      ? new Date(step.createdAt).toLocaleString('vi-VN')
      : '',
    active: true,
  }));

  return {
    ...order,
    id: order._id || order.id || '',
    date: new Date(order.createdAt || order.placedAt || Date.now()).toLocaleString(
      'vi-VN'
    ),
    status: normalizedStatus,
    items: (order.items || []).map((item) => ({
      id: item.product?._id || item.product || item.name,
      name: item.name || item.product?.name || 'San pham',
      qty: toNumber(item.quantity, 1),
      price: toNumber(item.unitPrice),
      image: item.image || item.product?.image || item.variant?.image || '',
      color: item.selectedColor || item.variant?.color || '',
      storage: item.selectedStorage || item.variant?.storage || '',
    })),
    totalAmount: toNumber(order.total),
    customer: {
      fullName: order.customerInfo?.fullName || '',
      phone: order.customerInfo?.phone || '',
      email: order.customerInfo?.email || '',
      address: formatAddress(order.shippingAddress),
      city: order.shippingAddress?.province || '',
    },
    payment: {
      method: order.paymentMethod || 'COD',
      methodLabel:
        PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod || 'COD',
    },
    summary: {
      subtotal: toNumber(order.subtotal),
      shipping: toNumber(order.shippingFee),
      discount: toNumber(order.discountTotal),
    },
    timeline,
  };
};

export const mapBrand = (brand = {}) => ({
  ...brand,
  id: brand._id || brand.id || brand.slug || brand.name,
  displayName: brand.name || '',
  slug:
    brand.slug ||
    String(brand.name || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase(),
});

export const mapAuthPayload = (payload = {}) => ({
  token: payload.token || '',
  user: normalizeUser(payload.user || {}),
});
