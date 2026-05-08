const brandSlugMap = {
  apple: 'iphone',
  iphone: 'iphone',
  samsung: 'samsung',
  xiaomi: 'xiaomi',
  oppo: 'oppo',
  vivo: 'vivo',
  realme: 'realme',
  nokia: 'nokia',
  honor: 'honor',
  huawei: 'huawei',
  asus: 'asus',
};

export const slugifyValue = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toSpecsObject = (specifications) => {
  if (!specifications) {
    return {};
  }

  if (specifications instanceof Map) {
    return Object.fromEntries(specifications.entries());
  }

  return typeof specifications === 'object' ? specifications : {};
};

const firstTruthy = (...values) => values.find((value) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return true;
});

const parseBatteryValue = (value = '') => {
  const match = String(value).match(/(\d{4,5})/);
  return match ? Number(match[1]) : 0;
};

const buildBrandKey = (brand = '') =>
  brandSlugMap[slugifyValue(brand)] || slugifyValue(brand);

const getSpecValue = (product, keys = []) => {
  const specs = toSpecsObject(product.specifications);
  const specEntries = Object.entries(specs);

  for (const key of keys) {
    const directValue = product[key];
    if (typeof directValue === 'string' && directValue.trim()) {
      return directValue.trim();
    }

    if (typeof directValue === 'number' && !Number.isNaN(directValue)) {
      return String(directValue);
    }

    const exactSpec = specs[key];
    if (typeof exactSpec === 'string' && exactSpec.trim()) {
      return exactSpec.trim();
    }

    const normalizedKey = slugifyValue(key);
    const matchedEntry = specEntries.find(
      ([specKey]) => slugifyValue(specKey) === normalizedKey
    );

    if (matchedEntry?.[1]) {
      return String(matchedEntry[1]).trim();
    }
  }

  return '';
};

export const resolveFrontendCategory = (product = {}) => {
  const searchableText = [
    product.name,
    product.brand,
    product.category,
    ...(product.tags || []),
    ...(product.features || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    /(iphone|samsung|xiaomi|oppo|vivo|realme|nokia|honor|huawei|smartphone|dien-thoai|dien thoai|galaxy|redmi|fold|flip)/.test(
      searchableText
    )
  ) {
    return 'dien-thoai';
  }

  if (/(macbook|laptop|notebook|vivobook|zenbook)/.test(searchableText)) {
    return 'laptop';
  }

  if (/(ipad|tablet|galaxy tab|tab )/.test(searchableText)) {
    return 'tablet';
  }

  if (/(watch|dong-ho|dong ho|smartwatch|garmin)/.test(searchableText)) {
    return 'dong-ho';
  }

  if (
    /(airpods|tai-nghe|tai nghe|earbud|headphone|loa|speaker|audio|am-thanh|am thanh)/.test(
      searchableText
    )
  ) {
    return 'am-thanh';
  }

  if (/(man-hinh|man hinh|monitor|display|ultrasharp|proart)/.test(searchableText)) {
    return 'man-hinh';
  }

  if (
    /(chuot|ban-phim|ban phim|keyboard|mouse|ssd|ram|vga|linh-kien|linh kien|component)/.test(
      searchableText
    )
  ) {
    return 'linh-kien-may-tinh';
  }

  if (
    /(camera|robot|massage|smart home|smart-home|purifier|air fryer|vacuum)/.test(
      searchableText
    )
  ) {
    return 'smart-home';
  }

  if (/(sim|goi-cuoc|goi cuoc|dich-vu|dich vu|service|data)/.test(searchableText)) {
    return 'dich-vu';
  }

  return 'dien-thoai';
};

const normalizeDiscount = (value = '') =>
  String(value || '').replace(/^-+/, '').trim();

const buildDiscount = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= price) {
    return '';
  }

  return `${Math.round(((originalPrice - price) / originalPrice) * 100)}%`;
};

const buildBaseSpecs = (product) => {
  const chip = firstTruthy(
    getSpecValue(product, ['chip', 'processor', 'cpu']),
    product.brand
  );
  const ram = firstTruthy(product.ram, getSpecValue(product, ['ram', 'memory']));
  const screen = firstTruthy(
    product.screen,
    getSpecValue(product, ['screen', 'display', 'screenSize'])
  );
  const panel = firstTruthy(
    getSpecValue(product, ['panel', 'displayType', 'technology']),
    product.category
  );
  const battery = firstTruthy(
    product.battery,
    getSpecValue(product, ['battery', 'batteryCapacity'])
  );

  return {
    chip: chip || '',
    ram: ram || '',
    screen: screen || '',
    panel: panel || '',
    pin: battery || '',
  };
};

export const normalizeProduct = (product = {}) => {
  const priceNum = Number(product.minPrice || product.price || 0);
  const originalPrice = Number(product.originalPrice || product.maxPrice || 0);
  const oldPriceNum = originalPrice > priceNum ? originalPrice : 0;
  const brand = firstTruthy(product.brand, 'PhoneSin');
  const brandKey = buildBrandKey(brand);
  const primaryImage = firstTruthy(
    product.image,
    Array.isArray(product.images) ? product.images[0] : ''
  );
  const specs = buildBaseSpecs(product);
  const category = resolveFrontendCategory(product);
  const availableColors = [
    ...new Set([...(product.availableColors || []), ...(product.colors || [])]),
  ].filter(Boolean);
  const availableStorages = [
    ...new Set([product.storage, ...(product.availableStorages || [])]),
  ].filter(Boolean);

  return {
    ...product,
    id: product.slug || product._id,
    routeId: product.slug || product._id,
    backendId: product._id,
    slug: product.slug || slugifyValue(product.name),
    name: product.name || 'San pham',
    brand,
    brandKey,
    category,
    backendCategory: product.category || '',
    image: primaryImage || '',
    images: [
      ...new Set(
        [primaryImage, ...(Array.isArray(product.images) ? product.images : [])].filter(
          Boolean
        )
      ),
    ],
    priceNum,
    oldPriceNum: oldPriceNum || undefined,
    discount: normalizeDiscount(product.discount) || buildDiscount(priceNum, oldPriceNum),
    memberPrice: Number(
      product.memberPrice || Math.max(priceNum - Math.round(priceNum * 0.005), 0)
    ),
    points: Number(product.points || Math.round(priceNum / 1000)),
    isHot:
      Boolean(product.isHot) ||
      Number(product.soldCount || 0) > 0 ||
      Number(product.rating || 0) >= 4,
    specs,
    ram: firstTruthy(product.ram, specs.ram),
    rom: firstTruthy(product.storage, getSpecValue(product, ['storage', 'rom', 'capacity'])),
    battery: firstTruthy(product.battery, specs.pin),
    batteryValue: parseBatteryValue(firstTruthy(product.battery, specs.pin)),
    cpu: specs.chip,
    refreshRate: getSpecValue(product, ['refreshRate', 'hz']),
    screenSize: firstTruthy(product.screen, specs.screen),
    availableColors,
    availableStorages,
    countInStock: Number(product.totalStock ?? product.countInStock ?? 0),
    subPromo: product.description || '',
    extraPromos:
      Array.isArray(product.features) && product.features.length > 0
        ? product.features.length
        : 5,
    createdAt: product.createdAt || '',
    soldCount: Number(product.soldCount || 0),
    rating: Number(product.rating || 0),
    status: product.status || 'active',
    priceDisplay: new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(priceNum),
  };
};

const buildDetailedSpecs = (product, normalizedProduct) => {
  const specs = toSpecsObject(product.specifications);
  const baseSpecs = [
    ['Thuong hieu', normalizedProduct.brand],
    ['Danh muc', product.category || normalizedProduct.category],
    ['Vi xu ly', normalizedProduct.cpu],
    ['RAM', normalizedProduct.ram],
    ['Bo nho trong', normalizedProduct.rom],
    ['Man hinh', normalizedProduct.screenSize],
    ['Pin', normalizedProduct.battery],
    ['Camera', firstTruthy(product.camera, getSpecValue(product, ['camera']))],
    ['Ton kho', `${normalizedProduct.countInStock}`],
  ];

  const merged = [...baseSpecs];

  Object.entries(specs).forEach(([label, value]) => {
    if (!value) {
      return;
    }

    const exists = merged.some(
      ([currentLabel]) => slugifyValue(currentLabel) === slugifyValue(label)
    );

    if (!exists) {
      merged.push([label, String(value)]);
    }
  });

  return merged
    .filter(([, value]) => value)
    .map(([label, value]) => ({ label, value }));
};

export const normalizeProductDetail = (product = {}, recentReviews = []) => {
  const normalizedProduct = normalizeProduct(product);
  const variantsSource = Array.isArray(product.variants) ? product.variants : [];
  const images = [
    ...new Set(
      [
        normalizedProduct.image,
        ...(Array.isArray(product.images) ? product.images : []),
        ...variantsSource.map((variant) => variant.image).filter(Boolean),
      ].filter(Boolean)
    ),
  ];
  const storages = [
    ...new Set([
      normalizedProduct.rom,
      ...(product.availableStorages || []),
      ...variantsSource.map((variant) => variant.storage),
    ]),
  ].filter(Boolean);
  const variants =
    variantsSource.length > 0
      ? variantsSource.map((variant, index) => ({
          id: variant._id || `variant-${index}`,
          storage: variant.storage || normalizedProduct.rom || `Phien ban ${index + 1}`,
          price: Number(variant.price || normalizedProduct.priceNum),
          color: variant.color || '',
          stock: Number(variant.stock || 0),
          image: variant.image || normalizedProduct.image,
        }))
      : storages.map((storage, index) => ({
          id: `variant-${index}`,
          storage,
          price: normalizedProduct.priceNum,
          color: '',
          stock: normalizedProduct.countInStock,
          image: normalizedProduct.image,
        }));
  const colorValues = [
    ...new Set([
      ...(product.availableColors || []),
      ...(product.colors || []),
      ...variantsSource.map((variant) => variant.color),
    ]),
  ].filter(Boolean);
  const colors = (colorValues.length > 0 ? colorValues : ['Mac dinh']).map(
    (name, index) => {
      const matchedVariant = variantsSource.find((variant) => variant.color === name);

      return {
        id: matchedVariant?._id || `color-${index}`,
        name,
        price: Number(matchedVariant?.price || normalizedProduct.priceNum),
        image: matchedVariant?.image || normalizedProduct.image,
      };
    }
  );

  return {
    ...normalizedProduct,
    description: product.description || '',
    images,
    variants,
    colors,
    features: Array.isArray(product.features) ? product.features : [],
    specs_detailed: buildDetailedSpecs(product, normalizedProduct),
    recentReviews,
  };
};

export const inflateProducts = (products = [], count = 0, prefix = 'display') => {
  if (!Array.isArray(products) || products.length === 0 || count <= 0) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => ({
    ...products[index % products.length],
    uiKey: `${prefix}-${index}`,
  }));
};
