import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const LOW_STOCK_THRESHOLD = 5;
const MONTHS_IN_REVENUE_CHART = 6;
const RECENT_USERS_LIMIT = 5;
const RECENT_ORDERS_LIMIT = 10;

const USER_ROLES = ['user', 'admin'];
const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'packing',
  'shipping',
  'delivered',
  'cancelled',
];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const createCountMap = (keys = []) =>
  Object.fromEntries(keys.map((key) => [key, 0]));

const buildBreakdown = (rows = [], defaultKeys = []) => {
  const breakdown = createCountMap(defaultKeys);

  for (const row of rows) {
    if (row?._id == null) {
      continue;
    }

    breakdown[String(row._id)] = row.count;
  }

  return breakdown;
};

const buildMonthRange = (monthOffset = 0, referenceDate = new Date()) => {
  const start = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + monthOffset,
    1
  );
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);

  return { start, end };
};

const buildDateRangeFilter = (field, range) => ({
  [field]: {
    $gte: range.start,
    $lt: range.end,
  },
});

// Dashboard revenue only counts completed orders that were not refunded.
const buildRecognizedRevenueMatch = (extraMatch = {}) => ({
  status: 'delivered',
  paymentStatus: { $ne: 'refunded' },
  ...extraMatch,
});

const formatMonthLabel = (date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

const getRevenueSummary = async (range = null) => {
  const matchStage = range
    ? buildRecognizedRevenueMatch(buildDateRangeFilter('createdAt', range))
    : buildRecognizedRevenueMatch();

  const [summary] = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  return {
    totalRevenue: summary?.totalRevenue || 0,
    totalOrders: summary?.totalOrders || 0,
  };
};

const getOverviewUsers = async (currentMonthRange, previousMonthRange) => {
  const [total, active, admins, currentMonthNew, previousMonthNew] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments(buildDateRangeFilter('createdAt', currentMonthRange)),
      User.countDocuments(buildDateRangeFilter('createdAt', previousMonthRange)),
    ]);

  return {
    total,
    active,
    admins,
    currentMonthNew,
    previousMonthNew,
  };
};

const getOverviewProducts = async () => {
  const [total, active, inactive] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ status: 'active' }),
    Product.countDocuments({ status: 'inactive' }),
  ]);

  return { total, active, inactive };
};

const getOverviewCategories = async () => {
  const [total, active, inactive] = await Promise.all([
    Category.countDocuments(),
    Category.countDocuments({ isActive: true }),
    Category.countDocuments({ isActive: false }),
  ]);

  return { total, active, inactive };
};

const getOverviewOrders = async () => {
  const [total, pending, delivered, cancelled, paid] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: 'delivered' }),
    Order.countDocuments({ status: 'cancelled' }),
    Order.countDocuments({ paymentStatus: 'paid' }),
  ]);

  return {
    total,
    pending,
    delivered,
    cancelled,
    paid,
  };
};

const getUserRoleBreakdown = async () => {
  const rows = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);

  return buildBreakdown(rows, USER_ROLES);
};

const getRecentUsers = async () => {
  return User.find()
    .select(
      'fullName email phone role isActive authProvider lastLoginAt createdAt'
    )
    .sort({ createdAt: -1 })
    .limit(RECENT_USERS_LIMIT)
    .lean();
};

const getMonthlyRevenue = async () => {
  const monthRanges = Array.from(
    { length: MONTHS_IN_REVENUE_CHART },
    (_, index) => buildMonthRange(index - (MONTHS_IN_REVENUE_CHART - 1))
  );
  const monthlySummaries = await Promise.all(
    monthRanges.map((range) => getRevenueSummary(range))
  );

  return monthRanges.map((range, index) => ({
    month: formatMonthLabel(range.start),
    revenue: monthlySummaries[index].totalRevenue,
    orderCount: monthlySummaries[index].totalOrders,
  }));
};

const getLowStockProducts = async () => {
  // Some products use countInStock directly, while others use variant stock.
  const [lowStockProductCount, lowStockVariantCount, products, variants] =
    await Promise.all([
      Product.countDocuments({
        status: 'active',
        countInStock: { $lte: LOW_STOCK_THRESHOLD },
      }),
      ProductVariant.countDocuments({
        isActive: true,
        stock: { $lte: LOW_STOCK_THRESHOLD },
      }),
      Product.find({
        status: 'active',
        countInStock: { $lte: LOW_STOCK_THRESHOLD },
      })
        .select('name slug image brand category countInStock status updatedAt')
        .sort({ countInStock: 1, updatedAt: -1 })
        .limit(10)
        .lean(),
      ProductVariant.find({
        isActive: true,
        stock: { $lte: LOW_STOCK_THRESHOLD },
      })
        .select('product color storage stock image isActive updatedAt')
        .populate('product', 'name slug image brand category status')
        .sort({ stock: 1, updatedAt: -1 })
        .limit(10)
        .lean(),
    ]);

  const lowStockProducts = [
    ...products.map((product) => ({
      type: 'product',
      _id: product._id,
      productId: product._id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      category: product.category,
      image: product.image,
      stock: product.countInStock,
      isActive: product.status === 'active',
      updatedAt: product.updatedAt,
    })),
    ...variants
      .filter((variant) => variant.product)
      .map((variant) => ({
        type: 'variant',
        _id: variant._id,
        productId: variant.product._id,
        name: variant.product.name,
        slug: variant.product.slug,
        brand: variant.product.brand,
        category: variant.product.category,
        image: variant.image || variant.product.image,
        stock: variant.stock,
        color: variant.color,
        storage: variant.storage,
        isActive: variant.isActive && variant.product.status === 'active',
        updatedAt: variant.updatedAt,
      })),
  ]
    .sort((firstItem, secondItem) => {
      if (firstItem.stock !== secondItem.stock) {
        return firstItem.stock - secondItem.stock;
      }

      return new Date(secondItem.updatedAt) - new Date(firstItem.updatedAt);
    })
    .slice(0, 10);

  return {
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    lowStockCount: lowStockProductCount + lowStockVariantCount,
    lowStockProducts,
  };
};

const getCategoryBreakdown = async () => {
  const [categories, counts] = await Promise.all([
    Category.find()
      .select('name slug description isActive createdAt updatedAt')
      .sort({ name: 1 })
      .lean(),
    Product.aggregate([
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
    ]),
  ]);

  const countMap = new Map(
    counts.map((item) => [
      item._id,
      {
        productCount: item.productCount,
        activeProductCount: item.activeProductCount,
      },
    ])
  );

  return categories.map((category) => {
    const matchedCount = countMap.get(category.name) || {
      productCount: 0,
      activeProductCount: 0,
    };

    return {
      ...category,
      ...matchedCount,
    };
  });
};

const getTopSellingProducts = async () => {
  const topSellingRows = await Order.aggregate([
    {
      $match: {
        status: 'delivered',
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        quantitySold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.lineTotal' },
        name: { $last: '$items.name' },
        image: { $last: '$items.image' },
        lastSoldAt: { $max: '$createdAt' },
      },
    },
    { $sort: { quantitySold: -1, revenue: -1 } },
    { $limit: 10 },
  ]);

  if (!topSellingRows.length) {
    return [];
  }

  const productIds = topSellingRows
    .map((item) => item._id)
    .filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds } })
    .select('name slug image brand category status rating numReviews')
    .lean();
  const productMap = new Map(
    products.map((product) => [String(product._id), product])
  );

  return topSellingRows.map((item) => {
    const product = productMap.get(String(item._id));

    return {
      _id: item._id,
      name: product?.name || item.name,
      slug: product?.slug || '',
      image: product?.image || item.image || '',
      brand: product?.brand || '',
      category: product?.category || '',
      status: product?.status || 'inactive',
      rating: product?.rating || 0,
      numReviews: product?.numReviews || 0,
      quantitySold: item.quantitySold,
      revenue: item.revenue,
      lastSoldAt: item.lastSoldAt,
    };
  });
};

const getRecentOrders = async () => {
  return Order.find()
    .select(
      'customerInfo shippingAddress total discountTotal shippingFee paymentMethod paymentStatus status createdAt updatedAt placedAt'
    )
    .populate('user', 'fullName email phone role isActive')
    .sort({ createdAt: -1 })
    .limit(RECENT_ORDERS_LIMIT)
    .lean();
};

const getOrderBreakdownByField = async (field, defaultKeys = []) => {
  const rows = await Order.aggregate([
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 },
      },
    },
  ]);

  return buildBreakdown(rows, defaultKeys);
};

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const currentMonthRange = buildMonthRange(0);
  const previousMonthRange = buildMonthRange(-1);

  const [
    usersOverview,
    productsOverview,
    categoriesOverview,
    ordersOverview,
    usersByRole,
    recentUsers,
    totalRevenue,
    currentMonthRevenue,
    previousMonthRevenue,
    monthlyRevenue,
    inventory,
    categoryBreakdown,
    topSellingProducts,
    recentOrders,
    ordersByStatus,
    ordersByPaymentStatus,
  ] = await Promise.all([
    getOverviewUsers(currentMonthRange, previousMonthRange),
    getOverviewProducts(),
    getOverviewCategories(),
    getOverviewOrders(),
    getUserRoleBreakdown(),
    getRecentUsers(),
    getRevenueSummary(),
    getRevenueSummary(currentMonthRange),
    getRevenueSummary(previousMonthRange),
    getMonthlyRevenue(),
    getLowStockProducts(),
    getCategoryBreakdown(),
    getTopSellingProducts(),
    getRecentOrders(),
    getOrderBreakdownByField('status', ORDER_STATUSES),
    getOrderBreakdownByField('paymentStatus', PAYMENT_STATUSES),
  ]);

  res.json({
    overview: {
      users: usersOverview,
      products: productsOverview,
      categories: categoriesOverview,
      orders: ordersOverview,
    },
    users: {
      byRole: usersByRole,
      recent: recentUsers,
    },
    revenue: {
      total: totalRevenue.totalRevenue,
      totalRecognizedOrders: totalRevenue.totalOrders,
      currentMonth: currentMonthRevenue.totalRevenue,
      currentMonthOrders: currentMonthRevenue.totalOrders,
      previousMonth: previousMonthRevenue.totalRevenue,
      previousMonthOrders: previousMonthRevenue.totalOrders,
      monthly: monthlyRevenue,
    },
    inventory,
    categories: {
      breakdown: categoryBreakdown,
    },
    products: {
      topSelling: topSellingProducts,
    },
    orders: {
      recent: recentOrders,
      byStatus: ordersByStatus,
      byPaymentStatus: ordersByPaymentStatus,
    },
  });
});
