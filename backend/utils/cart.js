import { calculateVoucherDiscount } from './voucher.js';

export const recalculateCart = (cart) => {
  cart.items.forEach((item) => {
    item.lineTotal = Number(item.unitPrice) * Number(item.quantity);
  });

  cart.subtotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0);
  cart.discountTotal = 0;

  if (cart.voucherSnapshot?.code) {
    const voucherResult = calculateVoucherDiscount(
      cart.voucherSnapshot,
      cart.subtotal
    );

    if (voucherResult.isValid) {
      cart.discountTotal = voucherResult.discountAmount;
    } else {
      cart.voucherCode = '';
      cart.voucherSnapshot = undefined;
    }
  }

  cart.total = Math.max(cart.subtotal - cart.discountTotal, 0);
  return cart;
};

export const emptyCartResponse = () => ({
  items: [],
  voucherCode: '',
  subtotal: 0,
  discountTotal: 0,
  total: 0,
  totalItems: 0,
});

export const withCartSummary = (cartDoc) => {
  if (!cartDoc) {
    return emptyCartResponse();
  }

  const cart = cartDoc?.toObject ? cartDoc.toObject() : cartDoc;

  return {
    ...cart,
    totalItems: (cart?.items || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    ),
  };
};
