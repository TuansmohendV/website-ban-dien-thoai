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
  const maxLimit = isAdminRequest ? 500 : 200;
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), maxLimit);
  const skip = (page - 1) * limit;

  const keyword = req.query.keyword || req.query.search || '';
  const brands = parseList(req.query.brand || req.query.brands);
  const categories = parseList(req.query.category || req.query.categories);
  const features = parseList(req.query.features || req.query.feature);
  
  // New Filter Fields
  const ram = req.query.ram || '';
  const rom = req.query.rom || req.query.storage || '';
  const network = req.query.network || '';
  const battery = req.query.battery || '';
  const nfc = req.query.nfc || '';
  const refreshRate = req.query.refreshRate || '';
  const screenSize = req.query.screenSize || '';
  const os = req.query.os || '';
  const camera = req.query.camera || '';
  const screenStandard = req.query.screenStandard || '';
  const memoryCard = req.query.memoryCard || '';
  const specialFeatures = req.query.specialFeatures || '';
  
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
    const categoryMapping = {
      'dien-thoai': ['Smartphone', 'Điện thoại', 'Dien thoai', 'Mobile', 'dien-thoai'],
      'laptop': ['Laptop', 'Máy tính xách tay', 'Notebook', 'laptop'],
      'tablet': ['Tablet', 'Máy tính bảng', 'iPad', 'tablet'],
      'dong-ho': ['Watch', 'Đồng hồ', 'Smartwatch', 'dong-ho'],
      'am-thanh': ['Audio', 'Sound', 'Earphone', 'Speaker', 'Loa', 'Tai nghe', 'am-thanh'],
      'man-hinh': ['Monitor', 'Màn hình', 'Screen', 'man-hinh'],
      'linh-kien-may-tinh': ['Component', 'Linh kiện', 'Linh kien', 'PC Component', 'linh-kien-may-tinh'],
      'phu-kien': ['Accessory', 'Phụ kiện', 'Phu kien', 'phu-kien'],
      'smart-home': ['Smart Home', 'Gia dụng', 'Gia dung', 'Camera', 'Robot', 'smart-home'],
      'tivi-dien-may': ['TV', 'Tivi', 'TiVi', 'Điện máy', 'Appliance', 'Gia dụng', 'tivi-dien-may'],
      'tivi,-dien-may': ['TV', 'Tivi', 'TiVi', 'Điện máy', 'Appliance', 'Gia dụng', 'tivi-dien-may'],
    };

    const expandedCategories = [];
    categories.forEach(cat => {
      expandedCategories.push(cat);
      if (categoryMapping[cat.toLowerCase()]) {
        expandedCategories.push(...categoryMapping[cat.toLowerCase()]);
      }
    });

    filters.push({
      category: {
        $in: [...new Set(expandedCategories)].map(
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

  // Spec-specific filters with multi-value support
  if (ram && ram !== 'Tất cả') {
    const rams = parseList(ram);
    const ramRegexes = rams.map((r) => buildRegex(r));
    filters.push({
      $or: [
        { ram: { $in: ramRegexes } },
        { 'specifications.ram': { $in: ramRegexes } },
      ],
    });
  }

  if (rom && rom !== 'Tất cả') {
    const roms = parseList(rom);
    const romRegexes = roms.map((r) => buildRegex(r));
    const variantMatchedIds = await ProductVariant.distinct('product', {
      storage: { $in: romRegexes },
      isActive: true,
    });
    filters.push({
      $or: [
        { storage: { $in: romRegexes } },
        { 'specifications.storage': { $in: romRegexes } },
        { 'specifications.rom': { $in: romRegexes } },
        { _id: { $in: variantMatchedIds } },
      ],
    });
  }

  if (network && network !== 'Tất cả') {
    const networks = parseList(network);
    const networkRegexes = networks.map((n) => buildRegex(n));
    filters.push({
      $or: [
        { features: { $in: networkRegexes } },
        { specifications: { $in: networkRegexes } },
        { 'specifications.network': { $in: networkRegexes } },
        { 'specifications.sim': { $in: networkRegexes } },
        { 'specifications.connectivity': { $in: networkRegexes } },
        { name: { $in: networkRegexes } },
      ],
    });
  }

  if (battery && battery !== 'Tất cả') {
    const batteryOptions = parseList(battery);
    const batteryFilters = [];

    batteryOptions.forEach((opt) => {
      if (opt.includes('Dưới')) {
        // Matches 0000-3999
        batteryFilters.push({ battery: { $regex: new RegExp(`[0-3]\\d{3}`, 'i') } });
      } else if (opt.includes('Trên')) {
        // Matches 5000-9999
        batteryFilters.push({ battery: { $regex: new RegExp(`[5-9]\\d{3}`, 'i') } });
      } else if (opt.includes('-')) {
        // Matches ranges like 4000mAh - 5000mAh (heuristic for 4xxx)
        const digits = opt.match(/\d+/);
        if (digits) {
          const firstDigit = digits[0][0];
          batteryFilters.push({ battery: { $regex: new RegExp(`${firstDigit}\\d{3}`, 'i') } });
        }
      } else {
        batteryFilters.push({ battery: buildRegex(opt) });
      }
    });

    if (batteryFilters.length > 0) {
      filters.push({ $or: batteryFilters });
    }
  }

  if (nfc && nfc !== 'Tất cả') {
    if (nfc.includes('Có')) {
      filters.push({
        $or: [
          { features: buildRegex('nfc') },
          { specifications: buildRegex('nfc') },
        ],
      });
    }
  }

  if (refreshRate && refreshRate !== 'Tất cả') {
    const rates = parseList(refreshRate);
    const rateRegexes = rates.map((r) => buildRegex(r));
    filters.push({
      $or: [
        { screen: { $in: rateRegexes } },
        { specifications: { $in: rateRegexes } },
      ],
    });
  }

  if (screenSize && screenSize !== 'Tất cả') {
    const sizes = parseList(screenSize);
    const sizeRegexes = sizes.map((s) => buildRegex(s));
    filters.push({
      $or: [
        { screen: { $in: sizeRegexes } },
        { 'specifications.screen': { $in: sizeRegexes } },
        { 'specifications.screenSize': { $in: sizeRegexes } },
      ],
    });
  }

  if (os && os !== 'Tất cả') {
    const osList = parseList(os);
    const osRegexes = osList.map((o) => buildRegex(o));
    filters.push({
      $or: [
        { 'specifications.os': { $in: osRegexes } },
        { 'specifications.operatingSystem': { $in: osRegexes } },
        { description: { $in: osRegexes } },
      ],
    });
  }

  if (camera && camera !== 'Tất cả') {
    const cameras = parseList(camera);
    const cameraRegexes = cameras.map((c) => buildRegex(c));
    filters.push({
      $or: [
        { camera: { $in: cameraRegexes } },
        { 'specifications.camera': { $in: cameraRegexes } },
        { 'specifications.rearCamera': { $in: cameraRegexes } },
        { 'specifications.frontCamera': { $in: cameraRegexes } },
      ],
    });
  }

  if (screenStandard && screenStandard !== 'Tất cả') {
    const standards = parseList(screenStandard);
    const standardRegexes = standards.map((s) => buildRegex(s));
    filters.push({
      $or: [
        { screen: { $in: standardRegexes } },
        { 'specifications.screen': { $in: standardRegexes } },
        { 'specifications.resolution': { $in: standardRegexes } },
      ],
    });
  }

  if (memoryCard && memoryCard !== 'Tất cả') {
    const cards = parseList(memoryCard);
    const cardRegexes = cards.map((c) => buildRegex(c));
    filters.push({
      $or: [
        { 'specifications.memoryCard': { $in: cardRegexes } },
        { features: { $in: cardRegexes } },
      ],
    });
  }

  if (specialFeatures && specialFeatures !== 'Tất cả') {
    const specFeatures = parseList(specialFeatures);
    const specFeatureRegexes = specFeatures.map((f) => buildRegex(f));
    filters.push({
      $or: [
        { features: { $in: specFeatureRegexes } },
        { 'specifications.specialFeatures': { $in: specFeatureRegexes } },
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
    newest: { isFeatured: -1, createdAt: -1 },
    priceAsc: { isFeatured: -1, price: 1 },
    priceDesc: { isFeatured: -1, price: -1 },
    rating: { isFeatured: -1, rating: -1, numReviews: -1 },
    popular: { isFeatured: -1, soldCount: -1, rating: -1 },
    bestseller: { isFeatured: -1, soldCount: -1 },
  };

  const sort = sortMap[req.query.sort] || sortMap[req.query.sortBy] || { isFeatured: -1, createdAt: -1 };



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
  const { 
    name, description, brand, categoryId, price, countInStock, image, images,
    tags, features, colors, screen, battery, camera, ram, storage, isHot, specifications,
    isFeatured, isBestSeller, isRecommended, videoUrl
  } = req.body;

  if (!name || !brand || !categoryId || !price || !description || !image) {
    return next(new AppError('Vui lòng nhập đầy đủ thông tin bắt buộc (Tên, Thương hiệu, Danh mục, Giá, Mô tả và Ảnh)', 400));
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
    tags: tags || [],
    features: features || [],
    colors: colors || [],
    screen,
    battery,
    camera,
    ram,
    storage,
    isHot: isHot || false,
    isFeatured: isFeatured || false,
    isBestSeller: isBestSeller || false,
    isRecommended: isRecommended || false,
    videoUrl: videoUrl || [],
    specifications: specifications || {},
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
  const { 
    name, description, brand, categoryId, price, countInStock, image, images, status,
    tags, features, colors, screen, battery, camera, ram, storage, isHot, specifications,
    isFeatured, isBestSeller, isRecommended, videoUrl
  } = req.body;

  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (brand !== undefined) product.brand = brand;
  if (categoryId !== undefined) product.category = categoryId;
  if (price !== undefined) product.price = price;
  if (countInStock !== undefined) product.countInStock = countInStock;
  if (image !== undefined) product.image = image;
  if (images !== undefined) product.images = images;
  if (status !== undefined) product.status = status;
  if (tags !== undefined) product.tags = tags;
  if (features !== undefined) product.features = features;
  if (colors !== undefined) product.colors = colors;
  if (screen !== undefined) product.screen = screen;
  if (battery !== undefined) product.battery = battery;
  if (camera !== undefined) product.camera = camera;
  if (ram !== undefined) product.ram = ram;
  if (storage !== undefined) product.storage = storage;
  if (isHot !== undefined) product.isHot = isHot;
  if (isFeatured !== undefined) product.isFeatured = isFeatured;
  if (isBestSeller !== undefined) product.isBestSeller = isBestSeller;
  if (isRecommended !== undefined) product.isRecommended = isRecommended;
  if (videoUrl !== undefined) product.videoUrl = videoUrl;
  if (specifications !== undefined) product.specifications = specifications;

  product = await product.save();

  res.json({
    status: 'success',
    message: 'Cập nhật sản phẩm thành công',
    data: { product },
  });
});

// Admin: Delete product
export const deleteAdminProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Không tìm thấy sản phẩm', 404));
  }

  // Soft delete: update status to inactive
  product.status = 'inactive';
  await product.save();

  // Also soft delete related variants
  await ProductVariant.updateMany({ product: product._id }, { isActive: false });

  res.json({
    status: 'success',
    message: 'Chuyển sản phẩm vào trạng thái đã xóa (xoá mềm) thành công',
  });
});
