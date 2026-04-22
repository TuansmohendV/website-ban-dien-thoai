const normalizeSpecText = (value) => {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  return String(value).trim();
};

const getSpecificationValue = (product, key) =>
  normalizeSpecText(product?.specifications?.get?.(key) ?? product?.specifications?.[key]);

export const buildProductSpecs = (product) => {
  if (!product) {
    return null;
  }

  const specs = {
    chip: getSpecificationValue(product, 'chip'),
    os: getSpecificationValue(product, 'os'),
    refreshRate: getSpecificationValue(product, 'refreshRate'),
    screen: normalizeSpecText(product.screen),
    battery: normalizeSpecText(product.battery),
    camera: normalizeSpecText(product.camera),
    ram: normalizeSpecText(product.ram),
    storage: normalizeSpecText(product.storage),
  };

  return {
    productId: product._id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    specifications: specs,
  };
};

export const buildComparableProductSpecs = (products = []) =>
  products.map((product) => buildProductSpecs(product)).filter(Boolean);
