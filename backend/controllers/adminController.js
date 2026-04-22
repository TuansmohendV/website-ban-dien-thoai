import mongoose from 'mongoose';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import User from '../models/User.js';
import Voucher from '../models/Voucher.js';
import {
  buildRegex,
  escapeRegex,
  getPagination,
  parseBoolean,
} from '../utils/admin.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';
import {
  broadcastPromotionNotification,
  createOrderStatusNotification,
} from '../utils/notification.js';
import { createTimelineEntry } from '../utils/order.js';
import { normalizePhone } from '../utils/phone.js';
import { toSlug } from '../utils/slug.js';

const parseArrayField = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
      try {
        const parsedValue = JSON.parse(trimmedValue);

        if (Array.isArray(parsedValue)) {
          return parsedValue
            .map((item) => String(item).trim())
            .filter(Boolean);
        }
      } catch {
        // Fall through to comma-separated parsing below.
      }
    }

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value == null) {
    return [];
  }

  return [String(value).trim()].filter(Boolean);
};

const isBase64ImageDataUrl = (value = '') =>
  /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(String(value).trim());

const buildProductImagePublicId = (baseName = '', suffix = 'image') => {
  const normalizedBaseName = toSlug(baseName) || `product-${Date.now()}`;
  return `${normalizedBaseName}-${suffix}-${Date.now()}`;
};

const uploadProductImageValue = async (value, { baseName, suffix }) => {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) {
    return '';
  }

  if (!isBase64ImageDataUrl(normalizedValue)) {
    return normalizedValue;
  }

  const uploadedFile = await uploadImageToCloudinary({
    fileData: normalizedValue,
    folder: 'mobile-shop/products',
    publicId: buildProductImagePublicId(baseName, suffix),
  });

  return uploadedFile.url;
};

const resolveProductImagePayload = async (
  body = {},
  payload = {},
  currentProduct = null
) => {
  const baseName =
    String(
      body.slug ||
        payload.slug ||
        body.name ||
        payload.name ||
        currentProduct?.slug ||
        currentProduct?.name ||
        ''
    ).trim() || `product-${Date.now()}`;

  if (typeof body.image !== 'undefined') {
    payload.image = await uploadProductImageValue(body.image, {
      baseName,
      suffix: 'main',
    });
  }

  if (typeof body.imageFileData !== 'undefined') {
    const uploadedMainImageUrl = await uploadProductImageValue(body.imageFileData, {
      baseName,
      suffix: 'main',
    });

    if (uploadedMainImageUrl) {
      payload.image = uploadedMainImageUrl;
    }
  }

  if (typeof body.images !== 'undefined') {
    const nextImages = [];
    const imageSources = parseArrayField(body.images);

    for (let index = 0; index < imageSources.length; index += 1) {
      const uploadedImageUrl = await uploadProductImageValue(imageSources[index], {
        baseName,
        suffix: `gallery-${index + 1}`,
      });

      if (uploadedImageUrl) {
        nextImages.push(uploadedImageUrl);
      }
    }

    payload.images = nextImages;
  }

  if (typeof body.imagesFileData !== 'undefined') {
    const imageSources = parseArrayField(body.imagesFileData);
    if (imageSources.length > 0) {
      const currentImages =
        typeof payload.images !== 'undefined'
          ? payload.images
          : Array.isArray(currentProduct?.images)
            ? [...currentProduct.images]
            : [];

      for (let index = 0; index < imageSources.length; index += 1) {
        const uploadedImageUrl = await uploadProductImageValue(imageSources[index], {
          baseName,
          suffix: `gallery-extra-${index + 1}`,
        });

        if (uploadedImageUrl) {
          currentImages.push(uploadedImageUrl);
        }
      }

      payload.images = currentImages;
    }
  }

  if (!payload.image) {
    if (Array.isArray(payload.images) && payload.images.length > 0) {
      payload.image = payload.images[0];
    } else if (currentProduct?.image) {
      payload.image = currentProduct.image;
    }
  }

  return payload;
};

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;
  delete user.tokenVersion;
  delete user.googleId;
  delete user.facebookId;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpiresAt;
  return user;
};

const buildProductPayload = (body = {}) => {
  const payload = {};
  const stringFields = [
    'name',
    'slug',
    'image',
    'brand',
    'category',
    'description',
    'screen',
    'battery',
    'camera',
    'ram',
    'storage',
    'status',
  ];
  const numberFields = [
    'price',
    'originalPrice',
    'countInStock',
    'rating',
    'numReviews',
    'soldCount',
  ];

  for (const field of stringFields) {
    if (typeof body[field] !== 'undefined') {
      payload[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
    }
  }

  for (const field of numberFields) {
    if (typeof body[field] !== 'undefined') {
      payload[field] = Number(body[field]);
    }
  }

  if (typeof body.images !== 'undefined') {
    payload.images = parseArrayField(body.images);
  }

  if (typeof body.colors !== 'undefined') {
    payload.colors = parseArrayField(body.colors);
  }

  if (typeof body.features !== 'undefined') {
    payload.features = parseArrayField(body.features);
  }

  if (typeof body.tags !== 'undefined') {
    payload.tags = parseArrayField(body.tags);
  }

  if (typeof body.specifications !== 'undefined') {
    payload.specifications = body.specifications || {};
  }

  return payload;
};

const buildVoucherPayload = (body = {}) => {
  const payload = {};
  const stringFields = ['code', 'description', 'discountType'];
  const numberFields = [
    'discountValue',
    'minOrderValue',
    'maxDiscount',
    'usageLimit',
    'usedCount',
    'usageLimitPerUser',
  ];

  for (const field of stringFields) {
    if (typeof body[field] !== 'undefined') {
      payload[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
    }
  }

  for (const field of numberFields) {
    if (typeof body[field] !== 'undefined') {
      payload[field] = Number(body[field]);
    }
  }

  if (typeof body.startsAt !== 'undefined') {
    payload.startsAt = body.startsAt ? new Date(body.startsAt) : undefined;
  }

  if (typeof body.expiresAt !== 'undefined') {
    payload.expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;
  }

  const nextActive = parseBoolean(body.isActive);

  if (typeof nextActive !== 'undefined') {
    payload.isActive = nextActive;
  }

  return payload;
};

const findCategoryByIdentifier = async (identifier) => {
  const normalizedIdentifier = String(identifier || '').trim();

  if (!normalizedIdentifier) {
    return null;
  }

  const query = mongoose.isValidObjectId(normalizedIdentifier)
    ? { _id: normalizedIdentifier }
    : {
        $or: [
          { slug: normalizedIdentifier },
          {
            name: new RegExp(
              `^${escapeRegex(normalizedIdentifier)}$`,
              'i'
            ),
          },
        ],
      };

  return Category.findOne(query);
};

const findBrandByIdentifier = async (identifier) => {
  const normalizedIdentifier = String(identifier || '').trim();

  if (!normalizedIdentifier) {
    return null;
  }

  const query = mongoose.isValidObjectId(normalizedIdentifier)
    ? { _id: normalizedIdentifier }
    : {
        $or: [
          { slug: normalizedIdentifier },
          {
            name: new RegExp(
              `^${escapeRegex(normalizedIdentifier)}$`,
              'i'
            ),
          },
        ],
      };

  return Brand.findOne(query);
};

const resolveProductCategoryPayload = async (body = {}) => {
  const hasCategoryName = typeof body.category !== 'undefined';
  const hasCategoryIdentifier =
    typeof body.categoryId !== 'undefined' ||
    typeof body.categoryRef !== 'undefined';

  if (!hasCategoryName && !hasCategoryIdentifier) {
    return {};
  }

  const categoryIdentifier = body.categoryId ?? body.categoryRef;

  if (hasCategoryIdentifier) {
    if (!categoryIdentifier) {
      return {
        categoryRef: null,
        ...(hasCategoryName
          ? { category: String(body.category || '').trim() }
          : {}),
      };
    }

    const category = await findCategoryByIdentifier(categoryIdentifier);

    if (!category) {
      throw new AppError(404, 'Không tìm thấy danh mục để gán cho sản phẩm.');
    }

    if (!category.isActive) {
      throw new AppError(400, 'Danh mục đã ngừng hoạt động, không thể gán.');
    }

    return {
      category: category.name,
      categoryRef: category._id,
    };
  }

  const categoryName = String(body.category || '').trim();

  if (!categoryName) {
    return {
      category: '',
      categoryRef: null,
    };
  }

  const matchedCategory = await findCategoryByIdentifier(categoryName);

  return {
    category: matchedCategory?.name || categoryName,
    categoryRef: matchedCategory?._id || null,
  };
};

const resolveProductBrandPayload = async (body = {}) => {
  const hasBrandName = typeof body.brand !== 'undefined';
  const hasBrandIdentifier =
    typeof body.brandId !== 'undefined' ||
    typeof body.brandRef !== 'undefined';

  if (!hasBrandName && !hasBrandIdentifier) {
    return {};
  }

  const brandIdentifier = body.brandId ?? body.brandRef;

  if (hasBrandIdentifier) {
    if (!brandIdentifier) {
      return {
        brandRef: null,
        ...(hasBrandName ? { brand: String(body.brand || '').trim() } : {}),
      };
    }

    const brand = await findBrandByIdentifier(brandIdentifier);

    if (!brand) {
      throw new AppError(404, 'Không tìm thấy thương hiệu để gán cho sản phẩm.');
    }

    if (!brand.isActive) {
      throw new AppError(400, 'Thương hiệu đã ngừng hoạt động, không thể gán.');
    }

    return {
      brand: brand.name,
      brandRef: brand._id,
    };
  }

  const brandName = String(body.brand || '').trim();

  if (!brandName) {
    return {
      brand: '',
      brandRef: null,
    };
  }

  const matchedBrand = await findBrandByIdentifier(brandName);

  return {
    brand: matchedBrand?.name || brandName,
    brandRef: matchedBrand?._id || null,
  };
};

const hydrateAdminProduct = async (query) => {
  return Product.findOne(query)
    .populate('brandRef', 'name slug logo isActive')
    .populate('categoryRef', 'name slug description isActive')
    .lean();
};

const hydrateAdminOrder = async (query) => {
  return Order.findOne(query)
    .populate('user', 'fullName email phone role isActive')
    .populate('items.product', 'name slug image brand category')
    .populate('items.variant', 'color storage image')
    .lean();
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
        throw new AppError(400, `Biến thể ${item.name} không đủ tồn kho để cập nhật.`);
      }

      variant.stock = nextStock;
      await variant.save();
      continue;
    }

    const product = await Product.findById(item.product);

    if (!product) {
      continue;
    }

    const nextStock = product.countInStock + direction * item.quantity;

    if (nextStock < 0) {
      throw new AppError(400, `Sản phẩm ${item.name} không đủ tồn kho để cập nhật.`);
    }

    product.countInStock = nextStock;
    await product.save();
  }
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

const orderStatusLabels = {
  pending: 'Đơn hàng chờ xử lý',
  confirmed: 'Đơn hàng đã xác nhận',
  packing: 'Đơn hàng đang đóng gói',
  shipping: 'Đơn hàng đang giao',
  delivered: 'Đơn hàng đã giao',
  cancelled: 'Đơn hàng đã bị hủy',
};

const paymentStatusLabels = {
  pending: 'Thanh toán đang chờ xử lý',
  paid: 'Thanh toán đã hoàn tất',
  failed: 'Thanh toán thất bại',
  refunded: 'Thanh toán đã hoàn tiền',
};

const validUserRoles = ['user', 'admin'];
const ADMIN_USER_SELECT_FIELDS =
  'fullName email phone avatar gender dateOfBirth authProvider role isActive lastLoginAt createdAt updatedAt';

const buildAdminUserPermissions = (role = 'user') => ({
  role,
  isAdmin: role === 'admin',
});

const getAdminUserAccountStatus = (isActive) =>
  isActive ? 'active' : 'inactive';

const formatAdminUser = (userDoc) => {
  const user = sanitizeUser(userDoc);

  return {
    ...user,
    permissions: buildAdminUserPermissions(user.role),
    accountStatus: getAdminUserAccountStatus(user.isActive),
  };
};

const buildAdminUserQuery = (queryParams = {}) => {
  const keyword = String(queryParams.keyword || queryParams.search || '').trim();
  const role = String(queryParams.role || '').trim().toLowerCase();
  const isActive = parseBoolean(queryParams.isActive);
  const query = {};

  if (keyword) {
    const keywordRegex = buildRegex(keyword);
    query.$or = [
      { fullName: keywordRegex },
      { email: keywordRegex },
      { phone: keywordRegex },
    ];
  }

  if (role) {
    query.role = role;
  }

  if (typeof isActive !== 'undefined') {
    query.isActive = isActive;
  }

  return query;
};

const buildAdminUsersSummary = ({
  matchingUsers,
  totalUsers,
  activeUsers,
  totalAdminAccounts,
  activeAdminAccounts,
}) => ({
  matchingUsers,
  totalUsers,
  activeUsers,
  totalAdminAccounts,
  activeAdminAccounts,
  regularUserAccounts: Math.max(totalUsers - totalAdminAccounts, 0),
});

const resolveNextAdminUserContact = async (user, body = {}) => {
  const nextEmail =
    typeof body.email !== 'undefined'
      ? String(body.email || '').toLowerCase().trim()
      : user.email;
  const nextPhone =
    typeof body.phone !== 'undefined'
      ? normalizePhone(String(body.phone || ''))
      : user.phone;

  if (nextEmail && nextEmail !== user.email) {
    const emailOwner = await User.findOne({
      email: nextEmail,
      _id: { $ne: user._id },
    });

    if (emailOwner) {
      throw new AppError(409, 'Email đã được dùng bởi tài khoản khác.');
    }
  }

  if (nextPhone && nextPhone !== user.phone) {
    const phoneOwner = await User.findOne({
      phone: nextPhone,
      _id: { $ne: user._id },
    });

    if (phoneOwner) {
      throw new AppError(409, 'Số điện thoại đã được dùng bởi tài khoản khác.');
    }
  }

  return { nextEmail, nextPhone };
};

const applyAdminUserProfileUpdates = (
  user,
  body = {},
  { nextEmail, nextPhone, nextIsActive }
) => {
  if (typeof body.fullName !== 'undefined') {
    user.fullName = String(body.fullName || '').trim() || user.fullName;
  }

  if (typeof body.avatar !== 'undefined') {
    user.avatar = body.avatar ?? '';
  }

  if (typeof body.gender !== 'undefined') {
    user.gender = body.gender;
  }

  if (typeof body.dateOfBirth !== 'undefined') {
    user.dateOfBirth = body.dateOfBirth || undefined;
  }

  if (typeof nextIsActive !== 'undefined') {
    user.isActive = nextIsActive;
  }

  user.email = nextEmail || undefined;
  user.phone = nextPhone || undefined;
};

export const getAdminUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, 10, 50);
  const query = buildAdminUserQuery(req.query);

  const [
    total,
    users,
    totalSystemUsers,
    totalAdminAccounts,
    activeAdminAccounts,
    activeSystemUsers,
  ] =
    await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select(ADMIN_USER_SELECT_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'admin', isActive: true }),
      User.countDocuments({ isActive: true }),
    ]);

  res.json({
    data: users.map(formatAdminUser),
    summary: buildAdminUsersSummary({
      matchingUsers: total,
      totalUsers: totalSystemUsers,
      activeUsers: activeSystemUsers,
      totalAdminAccounts,
      activeAdminAccounts,
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const createAdminUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '')
    .toLowerCase()
    .trim();
  const phone = normalizePhone(String(req.body.phone || ''));
  const password = String(req.body.password || '');
  const role = String(req.body.role || 'user')
    .trim()
    .toLowerCase();
  const nextIsActive = parseBoolean(req.body.isActive);

  if (!email && !phone) {
    throw new AppError(400, 'Vui lòng cung cấp email hoặc số điện thoại.');
  }

  if (!password || password.length < 6) {
    throw new AppError(400, 'Mật khẩu phải có ít nhất 6 ký tự.');
  }

  if (!validUserRoles.includes(role)) {
    throw new AppError(400, 'Quyền người dùng chỉ chấp nhận user hoặc admin.');
  }

  if (email) {
    const emailOwner = await User.findOne({ email });

    if (emailOwner) {
      throw new AppError(409, 'Email đã được dùng bởi tài khoản khác.');
    }
  }

  if (phone) {
    const phoneOwner = await User.findOne({ phone });

    if (phoneOwner) {
      throw new AppError(409, 'Số điện thoại đã được dùng bởi tài khoản khác.');
    }
  }

  const user = await User.create({
    fullName: String(req.body.fullName || '').trim() || 'Khach hang',
    email: email || undefined,
    phone: phone || undefined,
    password,
    avatar: req.body.avatar || '',
    gender: req.body.gender || 'other',
    dateOfBirth: req.body.dateOfBirth || undefined,
    role,
    isActive: typeof nextIsActive === 'undefined' ? true : nextIsActive,
  });

  res.status(201).json({
    message: 'Tạo người dùng thành công.',
    user: formatAdminUser(user),
  });
});

export const getAdminUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(ADMIN_USER_SELECT_FIELDS);

  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng.');
  }

  res.json({
    user: formatAdminUser(user),
  });
});

export const updateAdminUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng.');
  }

  if (typeof req.body.role !== 'undefined') {
    throw new AppError(
      400,
      'Cập nhật quyền admin/user hãy dùng endpoint PATCH /api/admin/users/:id/role.'
    );
  }

  const { nextEmail, nextPhone } = await resolveNextAdminUserContact(
    user,
    req.body
  );
  const nextIsActive = parseBoolean(req.body.isActive);

  if (String(user._id) === String(req.user._id)) {
    if (nextIsActive === false) {
      throw new AppError(400, 'Không thể tự khóa tài khoản admin hiện tại.');
    }
  }

  applyAdminUserProfileUpdates(user, req.body, {
    nextEmail,
    nextPhone,
    nextIsActive,
  });

  await user.save();

  res.json({
    message: 'Cập nhật thông tin người dùng thành công.',
    user: formatAdminUser(user),
  });
});

export const updateAdminUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng.');
  }

  if (String(user._id) === String(req.user._id)) {
    throw new AppError(
      400,
      'Admin không thể tự thay đổi quyền của chính mình.'
    );
  }

  const nextRole = String(req.body.role || '')
    .trim()
    .toLowerCase();

  if (!validUserRoles.includes(nextRole)) {
    throw new AppError(400, 'Quyền người dùng chỉ chấp nhận user hoặc admin.');
  }

  user.role = nextRole;
  await user.save();

  res.json({
    message: 'Cập nhật quyền người dùng thành công.',
    user: formatAdminUser(user),
  });
});

export const deactivateAdminUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError(404, 'Không tìm thấy người dùng.');
  }

  if (String(user._id) === String(req.user._id)) {
    throw new AppError(400, 'Không thể tự khóa tài khoản admin hiện tại.');
  }

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.json({
    message: 'Đã khóa người dùng thành công.',
    user: formatAdminUser(user),
  });
});

export const getAdminProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, 12, 100);
  const keyword = String(req.query.keyword || req.query.search || '').trim();
  const query = {};

  if (keyword) {
    const keywordRegex = buildRegex(keyword);
    query.$or = [
      { name: keywordRegex },
      { description: keywordRegex },
      { brand: keywordRegex },
      { category: keywordRegex },
      { tags: keywordRegex },
    ];
  }

  if (req.query.status) {
    query.status = String(req.query.status).trim();
  }

  if (req.query.brand) {
    query.brand = new RegExp(`^${escapeRegex(String(req.query.brand).trim())}$`, 'i');
  }

  if (req.query.brandId && mongoose.isValidObjectId(req.query.brandId)) {
    query.brandRef = req.query.brandId;
  }

  if (req.query.category) {
    query.category = new RegExp(`^${escapeRegex(String(req.query.category).trim())}$`, 'i');
  }

  if (req.query.categoryId && mongoose.isValidObjectId(req.query.categoryId)) {
    query.categoryRef = req.query.categoryId;
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('categoryRef', 'name slug isActive')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const getAdminProductById = asyncHandler(async (req, res) => {
  const product = await hydrateAdminProduct({ _id: req.params.id });

  if (!product) {
    throw new AppError(404, 'Không tìm thấy sản phẩm.');
  }

  const variants = await ProductVariant.find({ product: product._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    product,
    variants,
  });
});

export const createAdminProduct = asyncHandler(async (req, res) => {
  const payload = buildProductPayload(req.body);
  await resolveProductImagePayload(req.body, payload);
  Object.assign(payload, await resolveProductBrandPayload(req.body));
  Object.assign(payload, await resolveProductCategoryPayload(req.body));

  const product = await Product.create(payload);

  res.status(201).json({
    message: 'Tạo sản phẩm thành công.',
    product: await hydrateAdminProduct({ _id: product._id }),
  });
});

export const updateAdminProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError(404, 'Không tìm thấy sản phẩm.');
  }

  const payload = buildProductPayload(req.body);
  await resolveProductImagePayload(req.body, payload, product);
  Object.assign(payload, await resolveProductBrandPayload(req.body));
  Object.assign(payload, await resolveProductCategoryPayload(req.body));

  Object.assign(product, payload);
  await product.save();

  res.json({
    message: 'Cập nhật sản phẩm thành công.',
    product: await hydrateAdminProduct({ _id: product._id }),
  });
});

export const deactivateAdminProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError(404, 'Không tìm thấy sản phẩm.');
  }

  product.status = 'inactive';
  await product.save();

  res.json({
    message: 'Đã chuyển sản phẩm sang trạng thái ngừng kinh doanh.',
    product: await hydrateAdminProduct({ _id: product._id }),
  });
});

export const getAdminOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, 10, 100);
  const keyword = String(req.query.keyword || req.query.search || '').trim();
  const query = {};

  if (req.query.status) {
    query.status = String(req.query.status).trim();
  }

  if (req.query.paymentStatus) {
    query.paymentStatus = String(req.query.paymentStatus).trim();
  }

  if (keyword) {
    const keywordRegex = buildRegex(keyword);
    const conditions = [
      { 'customerInfo.fullName': keywordRegex },
      { 'customerInfo.email': keywordRegex },
      { 'customerInfo.phone': keywordRegex },
      { voucherCode: keywordRegex },
    ];

    if (mongoose.isValidObjectId(keyword)) {
      conditions.unshift({ _id: new mongoose.Types.ObjectId(keyword) });
    }

    query.$or = conditions;
  }

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'fullName email phone role isActive')
    .populate('items.product', 'name slug image')
    .populate('items.variant', 'color storage image')
    .lean();

  res.json({
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const getAdminOrderById = asyncHandler(async (req, res) => {
  const order = await hydrateAdminOrder({ _id: req.params.id });

  if (!order) {
    throw new AppError(404, 'Không tìm thấy đơn hàng.');
  }

  const payments = await Payment.find({ order: order._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    order,
    payments,
  });
});

export const updateAdminOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError(404, 'Không tìm thấy đơn hàng.');
  }

  const hasStatus = typeof req.body.status !== 'undefined';
  const hasPaymentStatus = typeof req.body.paymentStatus !== 'undefined';
  const hasNotes = typeof req.body.notes !== 'undefined';

  if (!hasStatus && !hasPaymentStatus && !hasNotes) {
    throw new AppError(400, 'Vui lòng cung cấp ít nhất một trường cần cập nhật.');
  }

  if (hasStatus) {
    const nextStatus = String(req.body.status).trim();

    if (order.status === 'cancelled' && nextStatus !== 'cancelled') {
      throw new AppError(400, 'Đơn đã hủy không thể chuyển lại sang trạng thái khác.');
    }

    if (order.status === 'delivered' && nextStatus === 'cancelled') {
      throw new AppError(400, 'Đơn đã giao không thể chuyển sang trạng thái hủy.');
    }

    if (nextStatus === 'cancelled' && order.status !== 'cancelled') {
      await adjustInventory(order.items, 1);
      await rollbackVoucherUsage(order.voucherCode, order.user);
    }

    order.status = nextStatus;
    order.timeline.push(
      createTimelineEntry(
        nextStatus,
        orderStatusLabels[nextStatus] || 'Cập nhật đơn hàng',
        req.body.timelineMessage ||
          req.body.note ||
          'Admin đã cập nhật trạng thái đơn hàng.'
      )
    );
  }

  if (hasPaymentStatus) {
    const nextPaymentStatus = String(req.body.paymentStatus).trim();

    order.paymentStatus = nextPaymentStatus;

    if (nextPaymentStatus === 'paid' && !order.paidAt) {
      order.paidAt = new Date();
    }

    order.timeline.push(
      createTimelineEntry(
        order.status,
        paymentStatusLabels[nextPaymentStatus] || 'Cập nhật thanh toán',
        req.body.paymentNote ||
          req.body.note ||
          'Admin đã cập nhật trạng thái thanh toán.'
      )
    );
  }

  if (hasNotes) {
    order.notes = req.body.notes || '';
  }

  await order.save();
  await createOrderStatusNotification(
    order,
    hasPaymentStatus && !hasStatus
      ? `Trạng thái thanh toán đơn hàng của bạn đã được cập nhật: ${paymentStatusLabels[order.paymentStatus] || order.paymentStatus}.`
      : undefined
  );

  res.json({
    message: 'Cập nhật đơn hàng thành công.',
    order: await hydrateAdminOrder({ _id: order._id }),
  });
});

export const getAdminVouchers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, 10, 100);
  const keyword = String(req.query.keyword || req.query.search || '').trim();
  const query = {};
  const isActive = parseBoolean(req.query.isActive);

  if (keyword) {
    const keywordRegex = buildRegex(keyword);
    query.$or = [{ code: keywordRegex }, { description: keywordRegex }];
  }

  if (typeof isActive !== 'undefined') {
    query.isActive = isActive;
  }

  const total = await Voucher.countDocuments(query);
  const vouchers = await Voucher.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({
    data: vouchers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const getAdminVoucherById = asyncHandler(async (req, res) => {
  const voucher = await Voucher.findById(req.params.id).lean();

  if (!voucher) {
    throw new AppError(404, 'Không tìm thấy voucher.');
  }

  res.json({ voucher });
});

export const createAdminVoucher = asyncHandler(async (req, res) => {
  const voucher = await Voucher.create(buildVoucherPayload(req.body));

  if (voucher.isActive) {
    await broadcastPromotionNotification({
      title: 'Khuyến mãi mới vừa được cập nhật',
      message: `Mã ${voucher.code} đang sẵn sàng để sử dụng cho đơn hàng đủ điều kiện.`,
      data: {
        voucherId: voucher._id,
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
      },
    });
  }

  res.status(201).json({
    message: 'Tạo voucher thành công.',
    voucher,
  });
});

export const updateAdminVoucher = asyncHandler(async (req, res) => {
  const voucher = await Voucher.findById(req.params.id);

  if (!voucher) {
    throw new AppError(404, 'Không tìm thấy voucher.');
  }

  Object.assign(voucher, buildVoucherPayload(req.body));
  await voucher.save();

  if (parseBoolean(req.body.broadcastPromotion) === true && voucher.isActive) {
    await broadcastPromotionNotification({
      title: 'Khuyến mãi mới vừa được gửi đến bạn',
      message: `Mã ${voucher.code} đã được cập nhật. Hãy kiểm tra ưu đãi và áp dụng cho đơn hàng phù hợp.`,
      data: {
        voucherId: voucher._id,
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
      },
    });
  }

  res.json({
    message: 'Cập nhật voucher thành công.',
    voucher,
  });
});

export const deactivateAdminVoucher = asyncHandler(async (req, res) => {
  const voucher = await Voucher.findById(req.params.id);

  if (!voucher) {
    throw new AppError(404, 'Không tìm thấy voucher.');
  }

  voucher.isActive = false;
  await voucher.save();

  res.json({
    message: 'Đã ngừng kích hoạt voucher.',
    voucher,
  });
});
