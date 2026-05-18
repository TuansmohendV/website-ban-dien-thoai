import crypto from 'crypto';

const MOMO_CREATE_PATH = '/v2/gateway/api/create';

const signHmacSha256 = (rawData, secretKey) =>
  crypto.createHmac('sha256', secretKey).update(rawData).digest('hex');

const getConfig = () => ({
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  requestType: process.env.MOMO_REQUEST_TYPE || 'payWithMethod',
  partnerName: process.env.MOMO_PARTNER_NAME || 'PhoneSin',
  storeId: process.env.MOMO_STORE_ID || 'PhoneSinStore',
});

const normalizeCreateEndpoint = (endpoint) => {
  const value = String(endpoint || '').trim().replace(/\/+$/, '');

  if (!value) {
    return 'https://test-payment.momo.vn/v2/gateway/api/create';
  }

  return value.endsWith('/create') ? value : `${value}${MOMO_CREATE_PATH}`;
};

export const isMoMoConfigured = () => {
  const { partnerCode, accessKey, secretKey, endpoint } = getConfig();
  return Boolean(partnerCode && accessKey && secretKey && endpoint);
};

const buildCreateSignature = ({
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
  secretKey,
}) => {
  const rawData =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

  return signHmacSha256(rawData, secretKey);
};

export const createMoMoPayment = async ({ order, redirectUrl, ipnUrl }) => {
  const config = getConfig();

  if (!isMoMoConfigured()) {
    throw new Error('Chưa cấu hình MoMo trong biến môi trường.');
  }

  const orderId = String(order._id);
  const requestId = `${orderId}_${Date.now()}`;
  const amount = Math.round(Number(order.total) || 0);
  const orderInfo = `Thanh toan don hang ${orderId}`;
  const extraData = Buffer.from(
    JSON.stringify({
      orderId,
      requestId,
    }),
    'utf8'
  ).toString('base64');

  const signature = buildCreateSignature({
    accessKey: config.accessKey,
    amount,
    extraData,
    ipnUrl,
    orderId,
    orderInfo,
    partnerCode: config.partnerCode,
    redirectUrl,
    requestId,
    requestType: config.requestType,
    secretKey: config.secretKey,
  });

  const payload = {
    partnerCode: config.partnerCode,
    partnerName: config.partnerName,
    storeId: config.storeId,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang: 'vi',
    requestType: config.requestType,
    autoCapture: true,
    extraData,
    signature,
  };

  const response = await fetch(normalizeCreateEndpoint(config.endpoint), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Không thể kết nối cổng thanh toán MoMo.');
  }

  const paymentUrl = data.payUrl || data.shortLink;

  if (String(data.resultCode) !== '0' || !paymentUrl) {
    throw new Error(data?.message || 'MoMo không trả về URL thanh toán.');
  }

  return {
    requestId,
    paymentUrl,
    response: data,
  };
};

export const verifyMoMoSignature = (payload = {}) => {
  const { accessKey, secretKey } = getConfig();

  if (!accessKey || !secretKey || !payload.signature) {
    return false;
  }

  const rawData =
    `accessKey=${accessKey}` +
    `&amount=${payload.amount ?? ''}` +
    `&extraData=${payload.extraData ?? ''}` +
    `&message=${payload.message ?? ''}` +
    `&orderId=${payload.orderId ?? ''}` +
    `&orderInfo=${payload.orderInfo ?? ''}` +
    `&orderType=${payload.orderType ?? ''}` +
    `&partnerCode=${payload.partnerCode ?? ''}` +
    `&payType=${payload.payType ?? ''}` +
    `&requestId=${payload.requestId ?? ''}` +
    `&responseTime=${payload.responseTime ?? ''}` +
    `&resultCode=${payload.resultCode ?? ''}` +
    `&transId=${payload.transId ?? ''}`;

  return payload.signature === signHmacSha256(rawData, secretKey);
};

export const getMoMoOrderId = (payload = {}) => {
  if (payload.extraData) {
    try {
      const extra = JSON.parse(Buffer.from(payload.extraData, 'base64').toString('utf8'));
      if (extra.orderId) {
        return String(extra.orderId);
      }
    } catch {
      // Keep the fallback below for legacy or malformed extraData.
    }
  }

  return String(payload.orderId || '').split('_')[0];
};
