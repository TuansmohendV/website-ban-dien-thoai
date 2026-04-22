import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import {
  buildRegex,
  escapeRegex,
  getPagination,
  parseBoolean,
} from '../utils/admin.js';

const buildCategoryPayload = (body = {}) => {
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

  const nextIsActive = parseBoolean(body.isActive);

  if (typeof nextIsActive !== 'undefined') {
    payload.isActive = nextIsActive;
  }

  return payload;
};

const findCategoryByIdentifier = async (identifier) => {
  const normalizedIdentifier = String(identifier || '').trim();

  if (!normalizedIdentifier) {
    throw new AppError(400, 'Thiếu mã danh mục cần xử lý.');
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

  const category = await Category.findOne(query);

  if (!category) {
    throw new AppError(404, 'Không tìm thấy danh mục.');
  }

  return category;
};

const buildProductCountMap = async (categoryNames = []) => {
  if (!categoryNames.length) {
    return new Map();
  }

  const counts = await Product.aggregate([
    {
      $match: {
        category: { $in: categoryNames },
      },
    },
    {
      $group: {
        _id: '$category',
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

const attachProductCounts = async (categories = []) => {
  const categoryNames = categories.map((category) => category.name);
  const countMap = await buildProductCountMap(categoryNames);

  return categories.map((category) => {
    const categoryObject = category.toObject
      ? category.toObject()
      : { ...category };
    const counts = countMap.get(categoryObject.name) || {
      productCount: 0,
      activeProductCount: 0,
    };

    return {
      ...categoryObject,
      ...counts,
    };
  });
};

const syncProductsWithCategory = async (categoryId, previousName, nextName) => {
  const matchConditions = [{ categoryRef: categoryId }];

  if (previousName && previousName !== nextName) {
    matchConditions.push({
      category: new RegExp(`^${escapeRegex(previousName)}$`, 'i'),
    });
  }

  await Product.updateMany(
    { $or: matchConditions },
    {
      $set: {
        category: nextName,
        categoryRef: categoryId,
      },
    }
  );
};

export const getAdminCategories = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, 10, 100);
  const keyword = String(req.query.keyword || req.query.search || '').trim();
  const query = {};
  const isActive = parseBoolean(req.query.isActive);

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

  const total = await Category.countDocuments(query);
  const categories = await Category.find(query)
    .sort({ isActive: -1, name: 1 })
    .skip(skip)
    .limit(limit);

  res.json({
    data: await attachProductCounts(categories),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const getAdminCategoryById = asyncHandler(async (req, res) => {
  const category = await findCategoryByIdentifier(req.params.id);
  const [categoryWithCounts] = await attachProductCounts([category]);

  res.json({
    category: categoryWithCounts,
  });
});

export const createAdminCategory = asyncHandler(async (req, res) => {
  const payload = buildCategoryPayload(req.body);

  if (!payload.name) {
    throw new AppError(400, 'Tên danh mục là bắt buộc.');
  }

  const category = await Category.create(payload);
  const [categoryWithCounts] = await attachProductCounts([category]);

  res.status(201).json({
    message: 'Tạo danh mục thành công.',
    category: categoryWithCounts,
  });
});

export const updateAdminCategory = asyncHandler(async (req, res) => {
  const category = await findCategoryByIdentifier(req.params.id);
  const previousName = category.name;

  Object.assign(category, buildCategoryPayload(req.body));

  if (!String(category.name || '').trim()) {
    throw new AppError(400, 'Tên danh mục là bắt buộc.');
  }

  await category.save();
  await syncProductsWithCategory(category._id, previousName, category.name);

  const [categoryWithCounts] = await attachProductCounts([category]);

  res.json({
    message: 'Cập nhật danh mục thành công.',
    category: categoryWithCounts,
  });
});

export const deactivateAdminCategory = asyncHandler(async (req, res) => {
  const category = await findCategoryByIdentifier(req.params.id);

  category.isActive = false;
  await category.save();

  const [categoryWithCounts] = await attachProductCounts([category]);

  res.json({
    message: 'Đã ngừng kích hoạt danh mục.',
    category: categoryWithCounts,
  });
});
