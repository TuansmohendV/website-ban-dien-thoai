import mongoose from 'mongoose';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import Review from '../models/Review.js';
import SearchHistory from '../models/SearchHistory.js';
import Wishlist from '../models/Wishlist.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import {
  buildComparableProductSpecs,
  buildProductSpecs,
} from '../utils/productSpecs.js';

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

const normalizeKeyword = (value = '') => String(value || '').trim();

const normalizeSearchKeyword = (value = '') =>
  normalizeKeyword(value).toLowerCase();

const buildVariantSummaryMap = (variants = []) => {
  const summaryMap = new Map();

  for (const variant of variants) {
    const productId = String(variant.product);
    const currentVariants = summaryMap.get(productId) || [];

    currentVariants.push(variant);
    summaryMap.set(productId, currentVariants);
  }

  return summaryMap;
};

const buildWishlistSet = async (userId, productIds = []) => {
  if (!userId || !productIds.length) {
    return new Set();
  }

  const items = await Wishlist.find({
    user: userId,
    product: { $in: productIds },
  })
    .select('product')
    .lean();

  return new Set(items.map((item) => String(item.product)));
};

const buildProductSummary = (product, productVariants = [], wishlistSet = new Set()) => {
  const variantPrices = productVariants.map((item) => item.price);
  const variantStocks = productVariants.map((item) => item.stock);

  return {
    ...product,
    hasVariants: productVariants.length > 0,
    variantCount: productVariants.length,
    isWishlisted: wishlistSet.has(String(product._id)),
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
};

const saveSearchHistory = async (userId, keyword, resultCount = 0) => {
  const normalizedKeyword = normalizeSearchKeyword(keyword);

  if (!userId || !normalizedKeyword) {
    return;
  }

  const keywordLabel = normalizeKeyword(keyword);

  await SearchHistory.findOneAndUpdate(
    {
      user: userId,
      normalizedKeyword,
    },
    {
      $set: {
        keyword: keywordLabel,
        normalizedKeyword,
        lastResultCount: Math.max(Number(resultCount) || 0, 0),
        lastSearchedAt: new Date(),
      },
      $inc: {
        totalSearches: 1,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

const findVariantMatchedProductIds = async ({
  storageValues = [],
  minPrice,
  maxPrice,
}) => {
  const variantFilters = { isActive: true };

  if (storageValues.length) {
    variantFilters.storage = {
      $in: storageValues.map((storage) => new RegExp(`^${escapeRegex(storage)}$`, 'i')),
    };
  }

  if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
    variantFilters.price = {};

    if (!Number.isNaN(minPrice)) {
      variantFilters.price.$gte = minPrice;
    }

    if (!Number.isNaN(maxPrice)) {
      variantFilters.price.$lte = maxPrice;
    }
  }

  if (Object.keys(variantFilters).length === 1) {
    return [];
  }

  return ProductVariant.distinct('product', variantFilters);
};

const buildProductQuery = async (queryParams = {}) => {
  const keyword = normalizeKeyword(queryParams.keyword || queryParams.search);
  const brands = parseList(queryParams.brand || queryParams.brands);
  const brandIds = parseList(queryParams.brandId || queryParams.brandIds).filter(
    (id) => mongoose.isValidObjectId(id)
  );
  const categories = parseList(queryParams.category || queryParams.categories);
  const features = parseList(queryParams.features || queryParams.feature);
  const ramValues = parseList(queryParams.ram);
  const storageValues = parseList(
    queryParams.storage || queryParams.rom || queryParams.storageOptions
  );
  const chipValues = parseList(queryParams.chip);
  const batteryValues = parseList(queryParams.battery);
  const minPrice = Number(queryParams.minPrice);
  const maxPrice = Number(queryParams.maxPrice);
  const minRating = Number(queryParams.minRating);

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
        { ram: keywordRegex },
        { storage: keywordRegex },
        { 'specifications.chip': keywordRegex },
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

  if (brandIds.length) {
    filters.push({
      brandRef: {
        $in: brandIds,
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

  if (ramValues.length) {
    filters.push({
      ram: {
        $in: ramValues.map((ram) => new RegExp(`^${escapeRegex(ram)}$`, 'i')),
      },
    });
  }

  if (chipValues.length) {
    filters.push({
      'specifications.chip': {
        $in: chipValues.map((chip) => new RegExp(`^${escapeRegex(chip)}$`, 'i')),
      },
    });
  }

  if (batteryValues.length) {
    filters.push({
      battery: {
        $in: batteryValues.map(
          (battery) => new RegExp(`^${escapeRegex(battery)}$`, 'i')
        ),
      },
    });
  }

  if (!Number.isNaN(minRating)) {
    filters.push({
      rating: { $gte: minRating },
    });
  }

  const variantMatchedIds = await findVariantMatchedProductIds({
    storageValues,
    minPrice,
    maxPrice,
  });

  if (storageValues.length) {
    filters.push({
      $or: [
        {
          storage: {
            $in: storageValues.map(
              (storage) => new RegExp(`^${escapeRegex(storage)}$`, 'i')
            ),
          },
        },
        { _id: { $in: variantMatchedIds } },
      ],
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

    filters.push({
      $or: [{ price: priceCondition }, { _id: { $in: variantMatchedIds } }],
    });
  }

  return {
    keyword,
    query: filters.length > 1 ? { $and: filters } : filters[0],
  };
};

export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
  const skip = (page - 1) * limit;
  const { keyword, query } = await buildProductQuery(req.query);

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
    .populate('brandRef', 'name slug logo isActive')
    .populate('categoryRef', 'name slug isActive')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const productIds = products.map((product) => product._id);
  const [variants, wishlistSet] = await Promise.all([
    productIds.length
      ? ProductVariant.find({
          product: { $in: productIds },
          isActive: true,
        }).lean()
      : [],
    buildWishlistSet(req.user?._id, productIds),
  ]);

  const variantSummaryMap = buildVariantSummaryMap(variants);
  const data = products.map((product) =>
    buildProductSummary(
      product,
      variantSummaryMap.get(String(product._id)) || [],
      wishlistSet
    )
  );

  await saveSearchHistory(req.user?._id, keyword, total);

  res.json({
    filters: {
      keyword,
      brands: parseList(req.query.brand || req.query.brands),
      brandIds: parseList(req.query.brandId || req.query.brandIds),
      categories: parseList(req.query.category || req.query.categories),
      ram: parseList(req.query.ram),
      storage: parseList(req.query.storage || req.query.rom),
      chip: parseList(req.query.chip),
      battery: parseList(req.query.battery),
      minPrice: Number.isNaN(Number(req.query.minPrice))
        ? null
        : Number(req.query.minPrice),
      maxPrice: Number.isNaN(Number(req.query.maxPrice))
        ? null
        : Number(req.query.maxPrice),
      minRating: Number.isNaN(Number(req.query.minRating))
        ? null
        : Number(req.query.minRating),
      sort: req.query.sort || 'newest',
    },
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
  const keyword = normalizeKeyword(req.query.q || req.query.keyword);

  if (!keyword) {
    const history = req.user
      ? await SearchHistory.find({ user: req.user._id })
          .sort({ lastSearchedAt: -1 })
          .limit(6)
          .lean()
      : [];

    return res.json({
      data: history.map((item) => ({
        type: 'history',
        keyword: item.keyword,
        totalSearches: item.totalSearches,
        lastSearchedAt: item.lastSearchedAt,
      })),
    });
  }

  const [suggestions, historySuggestions] = await Promise.all([
    Product.find({
      status: 'active',
      name: buildRegex(keyword),
    })
      .select('name slug image price brand')
      .limit(8)
      .lean(),
    req.user
      ? SearchHistory.find({
          user: req.user._id,
          normalizedKeyword: buildRegex(normalizeSearchKeyword(keyword)),
        })
          .sort({ lastSearchedAt: -1 })
          .limit(4)
          .lean()
      : [],
  ]);

  await saveSearchHistory(req.user?._id, keyword, suggestions.length);

  res.json({
    data: [
      ...historySuggestions.map((item) => ({
        type: 'history',
        keyword: item.keyword,
        totalSearches: item.totalSearches,
        lastSearchedAt: item.lastSearchedAt,
      })),
      ...suggestions.map((item) => ({
        type: 'product',
        ...item,
      })),
    ],
  });
});

export const compareProductSpecs = asyncHandler(async (req, res) => {
  const ids = parseList(req.query.ids).filter((id) => mongoose.isValidObjectId(id));

  if (ids.length < 2) {
    throw new AppError(400, 'Vui lòng cung cấp ít nhất 2 productId để so sánh.');
  }

  const products = await Product.find({
    _id: { $in: ids },
    status: 'active',
  })
    .select(
      'name slug brand category screen battery camera ram storage specifications'
    )
    .lean();

  if (products.length < 2) {
    throw new AppError(404, 'Không đủ sản phẩm hợp lệ để so sánh thông số.');
  }

  const productMap = new Map(products.map((product) => [String(product._id), product]));
  const orderedProducts = ids
    .map((id) => productMap.get(String(id)))
    .filter(Boolean);

  res.json({
    data: buildComparableProductSpecs(orderedProducts),
  });
});

export const getProductSpecs = asyncHandler(async (req, res) => {
  const identifier = req.params.id;
  const product = mongoose.isValidObjectId(identifier)
    ? await Product.findOne({ _id: identifier, status: 'active' }).lean()
    : await Product.findOne({ slug: identifier, status: 'active' }).lean();

  if (!product) {
    throw new AppError(404, 'Không tìm thấy sản phẩm để lấy thông số.');
  }

  res.json({
    specs: buildProductSpecs(product),
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const identifier = req.params.id;
  const product = mongoose.isValidObjectId(identifier)
    ? await Product.findOne({ _id: identifier, status: 'active' })
        .populate('brandRef', 'name slug logo isActive')
        .populate('categoryRef', 'name slug isActive')
        .lean()
    : await Product.findOne({ slug: identifier, status: 'active' })
        .populate('brandRef', 'name slug logo isActive')
        .populate('categoryRef', 'name slug isActive')
        .lean();

  if (!product) {
    throw new AppError(404, 'Không tìm thấy điện thoại.');
  }

  const [variants, reviews, wishlistSet] = await Promise.all([
    ProductVariant.find({
      product: product._id,
      isActive: true,
    }).lean(),
    Review.find({ product: product._id })
      .populate('user', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    buildWishlistSet(req.user?._id, [product._id]),
  ]);

  res.json({
    product: {
      ...buildProductSummary(product, variants, wishlistSet),
      variants,
      specs: buildProductSpecs(product),
    },
    recentReviews: reviews,
  });
});
