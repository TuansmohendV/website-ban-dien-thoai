import mongoose from 'mongoose';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import {
  buildRegex,
  escapeRegex,
  getPagination,
  parseBoolean,
} from '../utils/admin.js';

const buildBrandPayload = (body = {}) => {
  const payload = {};

  if (typeof body.name !== 'undefined') {
    payload.name = String(body.name || '').trim();
  }

  if (typeof body.slug !== 'undefined') {
    payload.slug = String(body.slug || '').trim();
  }

  if (typeof body.description !== 'undefined') {
    payload.description = String(body.description || '').trim();
  }

  if (typeof body.logo !== 'undefined') {
    payload.logo = String(body.logo || '').trim();
  }

  const nextIsActive = parseBoolean(body.isActive);

  if (typeof nextIsActive !== 'undefined') {
    payload.isActive = nextIsActive;
  }

  return payload;
};

const findBrandByIdentifier = async (identifier) => {
  const normalizedIdentifier = String(identifier || '').trim();

  if (!normalizedIdentifier) {
    throw new AppError(400, 'Thiếu mã thương hiệu cần xử lý.');
  }

  const query = mongoose.isValidObjectId(normalizedIdentifier)
    ? { _id: normalizedIdentifier }
    : {
        $or: [
          { slug: normalizedIdentifier },
          {
            name: new RegExp(`^${escapeRegex(normalizedIdentifier)}$`, 'i'),
          },
        ],
      };

  const brand = await Brand.findOne(query);

  if (!brand) {
    throw new AppError(404, 'Không tìm thấy thương hiệu.');
  }

  return brand;
};

const buildProductCountMap = async (brandNames = []) => {
  if (!brandNames.length) {
    return new Map();
  }

  const counts = await Product.aggregate([
    {
      $match: {
        brand: { $in: brandNames },
      },
    },
    {
      $group: {
        _id: '$brand',
        productCount: { $sum: 1 },
        activeProductCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0],
          },
        },
      },
    },
  ]);

  return new Map(
    counts.map((item) => [
      item._id,
      {
        productCount: item.productCount,
        activeProductCount: item.activeProductCount,
      },
    ])
  );
};

const attachProductCounts = async (brands = []) => {
  const countMap = await buildProductCountMap(brands.map((brand) => brand.name));

  return brands.map((brand) => {
    const brandObject = brand.toObject ? brand.toObject() : { ...brand };
    const counts = countMap.get(brandObject.name) || {
      productCount: 0,
      activeProductCount: 0,
    };

    return {
      ...brandObject,
      ...counts,
    };
  });
};

const syncProductsWithBrand = async (brandId, previousName, nextName) => {
  const matchConditions = [{ brandRef: brandId }];

  if (previousName && previousName !== nextName) {
    matchConditions.push({
      brand: new RegExp(`^${escapeRegex(previousName)}$`, 'i'),
    });
  }

  await Product.updateMany(
    { $or: matchConditions },
    {
      $set: {
        brand: nextName,
        brandRef: brandId,
      },
    }
  );
};

export const getBrands = asyncHandler(async (req, res) => {
  const keyword = String(req.query.keyword || req.query.search || '').trim();
  const query = { isActive: true };

  if (keyword) {
    const keywordRegex = buildRegex(keyword);
    query.$or = [
      { name: keywordRegex },
      { slug: keywordRegex },
      { description: keywordRegex },
    ];
  }

  const brands = await Brand.find(query).sort({ name: 1 });

  res.json({
    data: await attachProductCounts(brands),
  });
});

export const getBrandById = asyncHandler(async (req, res) => {
  const brand = await findBrandByIdentifier(req.params.id);

  if (!brand.isActive) {
    throw new AppError(404, 'Không tìm thấy thương hiệu đang hoạt động.');
  }

  const [brandWithCounts] = await attachProductCounts([brand]);

  res.json({
    brand: brandWithCounts,
  });
});

export const getAdminBrands = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, 10, 100);
  const keyword = String(req.query.keyword || req.query.search || '').trim();
  const isActive = parseBoolean(req.query.isActive);
  const query = {};

  if (keyword) {
    const keywordRegex = buildRegex(keyword);
    query.$or = [
      { name: keywordRegex },
      { slug: keywordRegex },
      { description: keywordRegex },
    ];
  }

  if (typeof isActive !== 'undefined') {
    query.isActive = isActive;
  }

  const total = await Brand.countDocuments(query);
  const brands = await Brand.find(query)
    .sort({ isActive: -1, name: 1 })
    .skip(skip)
    .limit(limit);

  res.json({
    data: await attachProductCounts(brands),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const getAdminBrandById = asyncHandler(async (req, res) => {
  const brand = await findBrandByIdentifier(req.params.id);
  const [brandWithCounts] = await attachProductCounts([brand]);

  res.json({
    brand: brandWithCounts,
  });
});

export const createAdminBrand = asyncHandler(async (req, res) => {
  const payload = buildBrandPayload(req.body);

  if (!payload.name) {
    throw new AppError(400, 'Tên thương hiệu là bắt buộc.');
  }

  const brand = await Brand.create(payload);
  const [brandWithCounts] = await attachProductCounts([brand]);

  res.status(201).json({
    message: 'Tạo thương hiệu thành công.',
    brand: brandWithCounts,
  });
});

export const updateAdminBrand = asyncHandler(async (req, res) => {
  const brand = await findBrandByIdentifier(req.params.id);
  const previousName = brand.name;

  Object.assign(brand, buildBrandPayload(req.body));

  if (!String(brand.name || '').trim()) {
    throw new AppError(400, 'Tên thương hiệu là bắt buộc.');
  }

  await brand.save();
  await syncProductsWithBrand(brand._id, previousName, brand.name);

  const [brandWithCounts] = await attachProductCounts([brand]);

  res.json({
    message: 'Cập nhật thương hiệu thành công.',
    brand: brandWithCounts,
  });
});

export const deactivateAdminBrand = asyncHandler(async (req, res) => {
  const brand = await findBrandByIdentifier(req.params.id);

  brand.isActive = false;
  await brand.save();

  const [brandWithCounts] = await attachProductCounts([brand]);

  res.json({
    message: 'Đã ngừng kích hoạt thương hiệu.',
    brand: brandWithCounts,
  });
});
