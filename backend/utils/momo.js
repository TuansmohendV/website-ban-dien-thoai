import crypto from 'crypto';

const MOMO_CREATE_URL = 'https://test-payment.momo.vn/v2/gateway/api/create';

const buildRawSignature = ({
  accessKey,
  amount,
  extraData,
  ipnUrl,
  orderId,
  orderInfo,
  partnerCode,
  redirectUrl,
  requestId,
  requestType,
}) =>
  `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

export const createMoMoPaymentUrl = async ({ order, redirectUrl, ipnUrl }) => {
  const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
  const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
  const secretKey = process.env.MOMO_SECRET_KEY || '0F8BBA842ECF85';
  const endpoint = process.env.MOMO_ENDPOINT || MOMO_CREATE_URL;
  const requestType = process.env.MOMO_REQUEST_TYPE || 'payWithMethod';
  const amount = String(Math.round(Number(order.total || 0)));
  const requestId = `${order._id}_${Date.now()}`;
  const momoOrderId = requestId;
  const orderInfo = `Thanh toán đơn hàng PhoneSin #${order._id.toString().slice(-6).toUpperCase()}`;
  const extraData = Buffer.from(
    JSON.stringify({ orderId: String(order._id), method: 'MOMO' })
  ).toString('base64');

  const rawSignature = buildRawSignature({
    accessKey,
    amount,
    extraData,
    ipnUrl,
    orderId: momoOrderId,
    orderInfo,
    partnerCode,
    redirectUrl,
    requestId,
    requestType,
  });

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partnerCode,
      partnerName: 'PhoneSin Mobile',
      storeId: 'PhoneSin',
      requestId,
      amount,
      orderId: momoOrderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      requestType,
      autoCapture: true,
      extraData,
      signature,
      orderGroupId: '',
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.payUrl) {
    throw new Error(data.message || 'Không thể tạo giao dịch MoMo.');
  }

  return {
    payUrl: data.payUrl,
    requestId,
    momoOrderId,
    providerResponse: data,
  };
};

export const verifyMoMoCallback = (payload = {}) => {
  const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
  const secretKey = process.env.MOMO_SECRET_KEY || '0F8BBA842ECF85';
  const rawSignature = `accessKey=${accessKey}&amount=${payload.amount}&extraData=${payload.extraData || ''}&message=${payload.message || ''}&orderId=${payload.orderId}&orderInfo=${payload.orderInfo || ''}&orderType=${payload.orderType || ''}&partnerCode=${payload.partnerCode}&payType=${payload.payType || ''}&requestId=${payload.requestId}&responseTime=${payload.responseTime}&resultCode=${payload.resultCode}&transId=${payload.transId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  return payload.signature === expectedSignature;
};

export const extractOrderIdFromMoMoPayload = (payload = {}) => {
  if (payload.extraData) {
    try {
      const decoded = JSON.parse(Buffer.from(payload.extraData, 'base64').toString('utf8'));
      if (decoded.orderId) {
        return decoded.orderId;
      }
    } catch {
      // Ignore malformed extraData and fall back to MoMo orderId parsing.
    }
  }

  return String(payload.orderId || '').split('_')[0];
};
