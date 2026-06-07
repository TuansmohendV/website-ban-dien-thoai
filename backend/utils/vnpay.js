import crypto from 'crypto';
import moment from 'moment';

const cleanEnvValue = (value) =>
  String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');

const getVNPayConfig = () => ({
  tmnCode: cleanEnvValue(process.env.VNP_TMN_CODE || process.env.VNP_TMNCODE),
  secretKey: cleanEnvValue(process.env.VNP_HASH_SECRET || process.env.VNP_HASHSECRET),
  vnpUrl: cleanEnvValue(process.env.VNP_URL),
  returnUrl: cleanEnvValue(process.env.VNP_RETURN_URL || process.env.VNP_RETURNURL),
});

export const isVNPayConfigured = () => {
  const { tmnCode, secretKey, vnpUrl } = getVNPayConfig();
  return Boolean(tmnCode && secretKey && vnpUrl);
};

const encodeVNPayValue = (value) =>
  encodeURIComponent(String(value)).replace(/%20/g, '+');

const buildVNPayQuery = (params = {}) =>
  Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeVNPayValue(params[key])}`)
    .join('&');

const getClientIp = (req) => {
  const rawIp =
    req.headers['x-forwarded-for'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    '127.0.0.1';

  let ipAddr = String(rawIp).split(',')[0].trim();

  if (ipAddr.startsWith('::ffff:')) {
    ipAddr = ipAddr.replace('::ffff:', '');
  }

  if (!ipAddr || ipAddr === '::1' || ipAddr === 'localhost') {
    return '127.0.0.1';
  }

  return ipAddr;
};

export const createVNPayUrl = (req, amount, orderId, returnUrl) => {
  const {
    tmnCode,
    secretKey,
    vnpUrl: configuredVNPayUrl,
    returnUrl: configuredReturnUrl,
  } = getVNPayConfig();
  let vnpUrl = configuredVNPayUrl;
  
  if (!tmnCode || !secretKey || !vnpUrl) {
    throw new Error('Chưa cấu hình VNPay trong biến môi trường');
  }

  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');
  const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');
  const txnRef = String(orderId);
  const ipAddr = getClientIp(req);
  
  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `Thanh toan don hang thiet bi di dong ma ${txnRef}`,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(Number(amount)) * 100,
    vnp_ReturnUrl: returnUrl || configuredReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const signData = buildVNPayQuery(vnp_Params);
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + buildVNPayQuery(vnp_Params);

  return vnpUrl;
};

export const verifyVNPayReturn = (vnp_Params) => {
  const { secretKey } = getVNPayConfig();
  if (!secretKey) return false;

  const secureHash = vnp_Params['vnp_SecureHash'];
  const signedParams = Object.keys(vnp_Params)
    .filter((key) => key.startsWith('vnp_'))
    .reduce((params, key) => {
      params[key] = vnp_Params[key];
      return params;
    }, {});
  
  delete signedParams['vnp_SecureHash'];
  delete signedParams['vnp_SecureHashType'];

  const signData = buildVNPayQuery(signedParams);
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return secureHash === signed;
};
