import crypto from 'crypto';
import AppError from './appError.js';

const parseCloudinaryUrl = (cloudinaryUrl = '') => {
  const normalizedUrl = String(cloudinaryUrl || '').trim();

  if (!normalizedUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(normalizedUrl);

    if (parsedUrl.protocol !== 'cloudinary:') {
      return null;
    }

    return {
      cloudName: decodeURIComponent(parsedUrl.hostname || '').trim(),
      apiKey: decodeURIComponent(parsedUrl.username || '').trim(),
      apiSecret: decodeURIComponent(parsedUrl.password || '').trim(),
    };
  } catch {
    return null;
  }
};

const getCloudinaryConfig = () => {
  const configFromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME || configFromUrl?.cloudName || '';
  const apiKey = process.env.CLOUDINARY_API_KEY || configFromUrl?.apiKey || '';
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET || configFromUrl?.apiSecret || '';

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(
      500,
      'Thiếu cấu hình Cloudinary. Hãy bổ sung CLOUDINARY_URL hoặc CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.'
    );
  }

  return { cloudName, apiKey, apiSecret };
};

const buildSignature = (params = {}, apiSecret = '') => {
  const signatureBase = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(`${signatureBase}${apiSecret}`)
    .digest('hex');
};

export const uploadImageToCloudinary = async ({
  fileData,
  folder = 'mobile-shop',
  publicId,
  resourceType = 'image',
}) => {
  if (!fileData) {
    throw new AppError(400, 'Thiếu dữ liệu hình ảnh để upload.');
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signedParams = {
    folder,
    timestamp,
  };

  if (publicId) {
    signedParams.public_id = publicId;
  }

  const signature = buildSignature(signedParams, apiSecret);
  const formData = new URLSearchParams();

  formData.set('file', fileData);
  formData.set('folder', folder);
  formData.set('timestamp', String(timestamp));
  formData.set('api_key', apiKey);
  formData.set('signature', signature);

  if (publicId) {
    formData.set('public_id', publicId);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new AppError(
      response.status,
      payload?.error?.message || 'Upload hình ảnh lên Cloudinary thất bại.'
    );
  }

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
    width: payload.width,
    height: payload.height,
    format: payload.format,
    bytes: payload.bytes,
  };
};
