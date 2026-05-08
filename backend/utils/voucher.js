export const isVoucherActive = (voucher) => {
  const now = new Date();

  if (!voucher || !voucher.isActive) {
    return false;
  }

  if (voucher.startsAt && voucher.startsAt > now) {
    return false;
  }

  if (voucher.expiresAt && voucher.expiresAt < now) {
    return false;
  }

  if (
    typeof voucher.usageLimit === 'number' &&
    voucher.usageLimit > 0 &&
    voucher.usedCount >= voucher.usageLimit
  ) {
    return false;
  }

  return true;
};

export const calculateVoucherDiscount = (voucherLike, subtotal) => {
  if (!voucherLike) {
    return {
      isValid: false,
      discountAmount: 0,
      message: 'Voucher không tồn tại.',
    };
  }

  if (subtotal <= 0) {
    return {
      isValid: false,
      discountAmount: 0,
      message: 'Đơn hàng chưa có giá trị để áp mã giảm giá.',
    };
  }

  if ((voucherLike.minOrderValue || 0) > subtotal) {
    return {
      isValid: false,
      discountAmount: 0,
      message: `Đơn hàng cần tối thiểu ${voucherLike.minOrderValue} để áp mã.`,
    };
  }

  let discountAmount = 0;

  if (voucherLike.discountType === 'percentage') {
    discountAmount = (subtotal * voucherLike.discountValue) / 100;
  } else {
    discountAmount = voucherLike.discountValue;
  }

  if (voucherLike.maxDiscount && voucherLike.maxDiscount > 0) {
    discountAmount = Math.min(discountAmount, voucherLike.maxDiscount);
  }

  discountAmount = Math.min(discountAmount, subtotal);

  return {
    isValid: discountAmount > 0,
    discountAmount,
    message:
      discountAmount > 0
        ? 'Áp dụng mã giảm giá thành công.'
        : 'Voucher không tạo ra giá trị giảm hợp lệ.',
  };
};
