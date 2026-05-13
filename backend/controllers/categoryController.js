import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { toSlug } from '../utils/slug.js';

const normalizeCategoryPayload = (body = {}) => {
  const payload = {};

  if (body.name !== undefined) {
    payload.name = String(body.name).trim();
  }

  if (body.slug !== undefined) {
    payload.slug = toSlug(body.slug);
  }

  if (body.description !== undefined) {
    payload.description = String(body.description).trim();
  }

  if (body.icon !== undefined) {
    payload.icon = String(body.icon).trim();
  }

  if (Array.isArray(body.subCategories)) {
    payload.subCategories = body.subCategories
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (body.isActive !== undefined) {
    payload.isActive = Boolean(body.isActive);
  }

  if (body.isFeatured !== undefined) {
    payload.isFeatured = Boolean(body.isFeatured);
  }

  return payload;
};

const buildProductCountGroups = async (includeInactive) => {
  const productMatch = includeInactive
    ? {}
    : { $or: [{ status: 'active' }, { status: { $exists: false } }] };

  return Product.aggregate([
    { $match: productMatch },
    {
      $group: {
        _id: {
          categoryRef: '$categoryRef',
          category: '$category',
        },
        productCount: { $sum: 1 },
      },
    },
  ]);
};

const attachProductCounts = (categories, productGroups, includeDerived) => {
  const knownIds = new Set(categories.map((category) => String(category._id)));
  const knownSlugs = new Set();

  const data = categories.map((category) => {
    const slug = category.slug || toSlug(category.name);
    const nameSlug = toSlug(category.name);
    let productCount = 0;

    knownSlugs.add(slug);
    knownSlugs.add(nameSlug);

    for (const group of productGroups) {
      const categoryRef = group._id?.categoryRef;
      const categoryName = group._id?.category || '';

      if (categoryRef && String(categoryRef) === String(category._id)) {
        productCount += group.productCount;
        continue;
      }

      if (!categoryRef || !knownIds.has(String(categoryRef))) {
        const groupSlug = toSlug(categoryName);
        if (groupSlug && (groupSlug === slug || groupSlug === nameSlug)) {
          productCount += group.productCount;
        }
      }
    }

    return {
      ...category,
      productCount,
    };
  });

  if (!includeDerived) {
    return data;
  }

  const derivedBySlug = new Map();

  for (const group of productGroups) {
    const categoryRef = group._id?.categoryRef;
    const categoryName = String(group._id?.category || '').trim();
    const slug = toSlug(categoryName);

    if (!categoryName || !slug || knownSlugs.has(slug)) {
      continue;
    }

    if (categoryRef && knownIds.has(String(categoryRef))) {
      continue;
    }

    const current = derivedBySlug.get(slug) || {
      _id: `derived-${slug}`,
      id: `derived-${slug}`,
      name: categoryName,
      slug,
      description: '',
      icon: '',
      subCategories: [],
      isActive: true,
      isDerived: true,
      productCount: 0,
    };

    current.productCount += group.productCount;
    derivedBySlug.set(slug, current);
  }

  return [...data, ...derivedBySlug.values()];
};

export const getCategories = asyncHandler(async (req, res) => {
  const isAdminRequest = req.user?.role === 'admin' || req.user?.isAdmin === true;
  const includeInactive = isAdminRequest && String(req.query.includeInactive) === 'true';
  const includeDerived = String(req.query.includeDerived) !== 'false';

  // Always fetch all categories from DB to ensure 'derived' logic knows which ones exist (even if inactive)
  const [allDbCategories, productGroups] = await Promise.all([
    Category.find({}).sort({ isFeatured: -1, createdAt: -1 }).lean(),
    buildProductCountGroups(includeInactive),
  ]);

  // Filter which DB categories to actually include in the logic based on isActive status
  const categoriesToProcess = includeInactive 
    ? allDbCategories 
    : allDbCategories.filter(c => c.isActive);

  // But we need ALL DB slugs to avoid creating 'derived' duplicates for inactive categories
  const allDbSlugs = new Set(allDbCategories.map(c => c.slug || toSlug(c.name)));
  allDbCategories.forEach(c => allDbSlugs.add(toSlug(c.name)));

  // Identify slugs that are explicitly inactive in the DB
  const inactiveSlugs = allDbCategories
    .filter(c => !c.isActive)
    .map(c => c.slug || toSlug(c.name));
  
  allDbCategories.filter(c => !c.isActive).forEach(c => inactiveSlugs.push(toSlug(c.name)));

  // Custom attach logic or modify attachProductCounts to handle knownSlugs better
  const data = attachProductCounts(categoriesToProcess, productGroups, includeDerived);
  
  // Final filter for derived categories: if it's derived but matches an inactive DB category, hide it
  const filteredData = data.filter(item => {
    if (!item.isDerived) return true;
    const slug = item.slug;
    const existsInDbAsInactive = allDbCategories.some(c => !c.isActive && (c.slug === slug || toSlug(c.name) === slug));
    return !existsInDbAsInactive;
  });

  res.json({
    data: filteredData,
    inactiveSlugs: [...new Set(inactiveSlugs)], // Include inactive slugs for frontend filtering
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const payload = normalizeCategoryPayload(req.body);

  if (!payload.name) {
    throw new AppError(400, 'Vui lòng nhập tên danh mục.');
  }

  const category = await Category.create(payload);

  res.status(201).json({
    message: 'Thêm danh mục thành công.',
    category,
  });
});

export const getCategoryDetail = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'ID danh mục không hợp lệ.');
  }

  const category = await Category.findById(req.params.id).lean();

  if (!category) {
    throw new AppError(404, 'Không tìm thấy danh mục.');
  }

  res.json({
    category,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'ID danh mục không hợp lệ.');
  }

  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError(404, 'Không tìm thấy danh mục.');
  }

  Object.assign(category, normalizeCategoryPayload(req.body));
  await category.save();

  res.json({
    message: 'Cập nhật danh mục thành công.',
    category,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError(400, 'ID danh mục không hợp lệ.');
  }

  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError(404, 'Không tìm thấy danh mục.');
  }

  // Soft delete
  category.isActive = false;
  await category.save();

  res.json({
    message: 'Chuyển danh mục vào trạng thái đã ẩn (xoá mềm) thành công.',
  });
});
