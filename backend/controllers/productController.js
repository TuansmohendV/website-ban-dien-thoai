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
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const skip = (page - 1) * limit;

  const keyword = req.query.keyword || req.query.search || '';
  const brands = parseList(req.query.brand);
  const categories = parseList(req.query.category);
  const features = parseList(req.query.features || req.query.feature);
  const storage = req.query.storage || '';
  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);

  const filters = [{ status: 'active' }];

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

  const query = filters.length > 1 ? { $and: filters } : filters[0];

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
