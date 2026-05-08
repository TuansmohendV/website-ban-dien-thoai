import mongoose from 'mongoose';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import Review from '../models/Review.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

const escapeRegex = (value = '') =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildRegex = (value = '') => new RegExp(escapeRegex(value), 'i');

const parseList = (value) => {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildVariantSummaryMap = (variants) => {
  const summaryMap = new Map();

  for (const variant of variants) {
    const productId = String(variant.product);
    const current = summaryMap.get(productId) || [];
    current.push(variant);
    summaryMap.set(productId, current);
  }

  return summaryMap;
};

export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const isAdminRequest = req.user?.role === 'admin' || req.user?.isAdmin === true;
  const maxLimit = isAdminRequest ? 200 : 50;
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), maxLimit);
  const skip = (page - 1) * limit;

  const keyword = req.query.keyword || req.query.search || '';
  const brands = parseList(req.query.brand);
  const categories = parseList(req.query.category);
  const features = parseList(req.query.features || req.query.feature);
  const storage = req.query.storage || '';
  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);

  const includeInactive =
    isAdminRequest && String(req.query.includeInactive) === 'true';
  const filters = includeInactive ? [] : [{ status: 'active' }];

  if (keyword) {
    const keywordRegex = buildRegex(keyword);
    filters.push({
      $or: [
        { name: keywordRegex },
        { description: keywordRegex },
        { brand: keywordRegex },
        { category: keywordRegex },
        { tags: keywordRegex },
        { features: keywordRegex },
      ],
    });
  }

  if (brands.length) {
    filters.push({
      brand: {
        $in: brands.map((brand) => new RegExp(`^${escapeRegex(brand)}$`, 'i')),
      },
    });
  }

  if (categories.length) {
    filters.push({
      category: {
        $in: categories.map(
          (category) => new RegExp(`^${escapeRegex(category)}$`, 'i')
        ),
      },
    });
  }

  if (features.length) {
    filters.push({
      features: {
        $all: features.map((feature) => buildRegex(feature)),
      },
    });
  }

  if (storage) {
    const storageRegex = buildRegex(storage);
    const variantMatchedIds = await ProductVariant.distinct('product', {
      storage: storageRegex,
      isActive: true,
    });

    filters.push({
      $or: [{ storage: storageRegex }, { _id: { $in: variantMatchedIds } }],
    });
  }

  if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
    const priceCondition = {};

    if (!Number.isNaN(minPrice)) {
      priceCondition.$gte = minPrice;
    }

    if (!Number.isNaN(maxPrice)) {
      priceCondition.$lte = maxPrice;
    }

    const variantMatchedIds = await ProductVariant.distinct('product', {
      ...priceCondition,
      isActive: true,
    });

    filters.push({
      $or: [{ price: priceCondition }, { _id: { $in: variantMatchedIds } }],
    });
  }

  const query =
    filters.length > 1 ? { $and: filters } : filters[0] || {};

  const sortMap = {
    newest: { createdAt: -1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    rating: { rating: -1, numReviews: -1 },
    popular: { soldCount: -1, rating: -1 },
  };

  const sort = sortMap[req.query.sort] || { createdAt: -1 };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const productIds = products.map((product) => product._id);
  const variants = productIds.length
    ? await ProductVariant.find({
        product: { $in: productIds },
        isActive: true,
      }).lean()
    : [];

  const variantSummaryMap = buildVariantSummaryMap(variants);

  const data = products.map((product) => {
    const productVariants = variantSummaryMap.get(String(product._id)) || [];
    const variantPrices = productVariants.map((item) => item.price);
    const variantStocks = productVariants.map((item) => item.stock);

    return {
      ...product,
      hasVariants: productVariants.length > 0,
      variantCount: productVariants.length,
      minPrice:
        variantPrices.length > 0
          ? Math.min(product.price, ...variantPrices)
          : product.price,
      maxPrice:
        variantPrices.length > 0
          ? Math.max(product.price, ...variantPrices)
          : product.price,
      totalStock:
        variantStocks.length > 0
          ? variantStocks.reduce((sum, stock) => sum + stock, 0)
          : product.countInStock,
      availableColors: [
        ...new Set([
          ...(product.colors || []),
          ...productVariants.map((item) => item.color).filter(Boolean),
        ]),
      ],
      availableStorages: [
        ...new Set([
          product.storage,
          ...productVariants.map((item) => item.storage),
        ].filter(Boolean)),
      ],
    };
  });

  res.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const getProductSuggestions = asyncHandler(async (req, res) => {
  const keyword = req.query.q || req.query.keyword || '';

  if (!keyword.trim()) {
    return res.json({ data: [] });
  }

  const suggestions = await Product.find({
    status: 'active',
    name: buildRegex(keyword),
  })
    .select('name slug image price brand')
    .limit(8)
    .lean();

  res.json({
    data: suggestions,
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const identifier = req.params.id;

  const product = mongoose.isValidObjectId(identifier)
    ? await Product.findOne({ _id: identifier, status: 'active' }).lean()
    : await Product.findOne({ slug: identifier, status: 'active' }).lean();

  if (!product) {
    throw new AppError(404, 'Không tìm thấy điện thoại.');
  }

  const [variants, reviews] = await Promise.all([
    ProductVariant.find({
      product: product._id,
      isActive: true,
    }).lean(),
    Review.find({ product: product._id })
      .populate('user', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  res.json({
    product: {
      ...product,
      variants,
      totalStock:
        variants.length > 0
          ? variants.reduce((sum, item) => sum + item.stock, 0)
          : product.countInStock,
      availableColors: [
        ...new Set([
          ...(product.colors || []),
          ...variants.map((item) => item.color).filter(Boolean),
        ]),
      ],
      availableStorages: [
        ...new Set([
          product.storage,
          ...variants.map((item) => item.storage),
        ].filter(Boolean)),
      ],
    },
    recentReviews: reviews,
  });
});

export const getProductSpecs = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();

  if (!product) {
    throw new AppError(404, 'Không tìm thấy sản phẩm.');
  }

  const variants = await ProductVariant.find({
    product: product._id,
    isActive: true,
  }).lean();

  res.json({
    product: {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      brand: product.brand,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
    },
    specs: {
      screen: product.screen || '',
      battery: product.battery || '',
      camera: product.camera || '',
      ram: product.ram || '',
      storage: product.storage || '',
      ...product.specifications,
    },
    colors: product.colors || [],
    features: product.features || [],
    variants: variants.map((v) => ({
      _id: v._id,
      color: v.color,
      storage: v.storage,
      price: v.price,
      stock: v.stock,
    })),
  });
});

export const compareProductSpecs = asyncHandler(async (req, res) => {
  const ids = (req.query.ids || '').split(',').map((id) => id.trim()).filter(Boolean);

  if (ids.length < 2) {
    throw new AppError(400, 'Cần ít nhất 2 sản phẩm để so sánh.');
  }

  const products = await Product.find({ _id: { $in: ids } }).lean();

  if (products.length < 2) {
    throw new AppError(404, 'Không tìm đủ sản phẩm để so sánh.');
  }

  const compareData = products.map((product) => ({
    _id: product._id,
    name: product.name,
    slug: product.slug,
    image: product.image,
    brand: product.brand,
    price: product.price,
    originalPrice: product.originalPrice,
    specs: {
      screen: product.screen || '',
      battery: product.battery || '',
      camera: product.camera || '',
      ram: product.ram || '',
      storage: product.storage || '',
      ...product.specifications,
    },
    colors: product.colors || [],
    features: product.features || [],
    rating: product.rating || 0,
    numReviews: product.numReviews || 0,
  }));

  res.json({
    data: compareData,
  });
});

// Admin: Create product
export const createAdminProduct = asyncHandler(async (req, res, next) => {
  const { name, description, brand, categoryId, price, countInStock, image, images } =
    req.body;

  if (!name || !brand || !categoryId || !price) {
    return next(new AppError('Vui lòng nhập đầy đủ thông tin bắt buộc', 400));
  }

  const product = await Product.create({
    name,
    description,
    brand,
    category: categoryId,
    price,
    countInStock: countInStock || 0,
    image,
    images: images || [],
    status: 'active',
  });

  res.status(201).json({
    status: 'success',
    message: 'Tạo sản phẩm thành công',
    data: { product },
  });
});

// Admin: Get all products
export const getAdminProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  if (status) {
    query.status = status;
  }

  const products = await Product.find(query)
    .limit(limit * 1)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(query);

  res.json({
    status: 'success',
    data: products,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    },
  });
});

// Admin: Get product detail
export const getAdminProductDetail = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');

  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  const variants = await ProductVariant.find({ product: product._id });

  res.json({
    status: 'success',
    data: { product, variants },
  });
});

// Admin: Update product
export const updateAdminProduct = asyncHandler(async (req, res, next) => {
  const { name, description, brand, categoryId, price, countInStock, image, images, status } =
    req.body;

  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  if (name) product.name = name;
  if (description) product.description = description;
  if (brand) product.brand = brand;
  if (categoryId) product.category = categoryId;
  if (price) product.price = price;
  if (countInStock !== undefined) product.countInStock = countInStock;
  if (image) product.image = image;
  if (images) product.images = images;
  if (status) product.status = status;

  product = await product.save();

  res.json({
    status: 'success',
    message: 'Cập nhật sản phẩm thành công',
    data: { product },
  });
});

// Admin: Delete product
export const deleteAdminProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  // Delete related variants
  await ProductVariant.deleteMany({ product: product._id });

  res.json({
    status: 'success',
    message: 'Xóa sản phẩm thành công',
  });
});
