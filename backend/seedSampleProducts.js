import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import ProductVariant from './models/ProductVariant.js';
import { toSlug } from './utils/slug.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const SAMPLE_TAG = 'sample-api-test';
const SAMPLE_BATCH = 'sample-batch-20-products';

const createImage = (label, suffix = '') => {
  const text = suffix ? `${label} ${suffix}` : label;
  return `https://placehold.co/600x600/png?text=${encodeURIComponent(text)}`;
};

const alternateStorage = (value = '') => {
  const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const index = storageOptions.indexOf(String(value).trim().toUpperCase());

  if (index === -1) {
    return value;
  }

  if (index === storageOptions.length - 1) {
    return storageOptions[index - 1];
  }

  return storageOptions[index + 1];
};

const buildSku = (slug, storage, color, suffix) => {
  const safeStorage = String(storage).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const safeColor = String(color).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  return `${slug}-${safeStorage}-${safeColor}-${suffix}`.toUpperCase();
};

const sampleProducts = [
  {
    name: 'Sample API iPhone 15',
    brand: 'Apple',
    description: 'Sample product for API testing with stable stock and pricing.',
    price: 18990000,
    originalPrice: 20990000,
    countInStock: 20,
    screen: '6.1 inch Super Retina XDR',
    battery: '3349mAh',
    camera: '48MP + 12MP',
    ram: '6GB',
    storage: '128GB',
    colors: ['Black', 'Pink', 'Blue'],
    features: ['5G', 'Face ID', 'OLED'],
    tags: ['iphone', 'apple', 'ios'],
    specifications: {
      chip: 'A16 Bionic',
      os: 'iOS 18',
      refreshRate: '60Hz',
    },
  },
  {
    name: 'Sample API iPhone 15 Pro',
    brand: 'Apple',
    description: 'Premium Apple sample phone for testing product list and detail APIs.',
    price: 25990000,
    originalPrice: 27990000,
    countInStock: 14,
    screen: '6.1 inch ProMotion OLED',
    battery: '3274mAh',
    camera: '48MP + 12MP + 12MP',
    ram: '8GB',
    storage: '256GB',
    colors: ['Natural Titanium', 'Black Titanium', 'Blue Titanium'],
    features: ['5G', 'ProMotion', 'Titanium'],
    tags: ['iphone', 'apple', 'pro'],
    specifications: {
      chip: 'A17 Pro',
      os: 'iOS 18',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API iPhone 15 Pro Max',
    brand: 'Apple',
    description: 'High-end iPhone sample with strong camera specs for API demos.',
    price: 29990000,
    originalPrice: 32990000,
    countInStock: 12,
    screen: '6.7 inch ProMotion OLED',
    battery: '4422mAh',
    camera: '48MP + 12MP + 12MP',
    ram: '8GB',
    storage: '256GB',
    colors: ['White Titanium', 'Natural Titanium', 'Black Titanium'],
    features: ['5G', 'Telephoto', 'Titanium'],
    tags: ['iphone', 'apple', 'pro-max'],
    specifications: {
      chip: 'A17 Pro',
      os: 'iOS 18',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API Samsung Galaxy S24',
    brand: 'Samsung',
    description: 'Compact Samsung flagship sample for filter and search API tests.',
    price: 20990000,
    originalPrice: 22990000,
    countInStock: 17,
    screen: '6.2 inch Dynamic AMOLED 2X',
    battery: '4000mAh',
    camera: '50MP + 12MP + 10MP',
    ram: '8GB',
    storage: '256GB',
    colors: ['Onyx Black', 'Marble Gray', 'Cobalt Violet'],
    features: ['5G', 'AMOLED', 'Galaxy AI'],
    tags: ['samsung', 'galaxy', 'android'],
    specifications: {
      chip: 'Exynos 2400',
      os: 'Android 14',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    description: 'Ultra Samsung sample device for premium product flows.',
    price: 28990000,
    originalPrice: 31990000,
    countInStock: 11,
    screen: '6.8 inch Dynamic AMOLED 2X',
    battery: '5000mAh',
    camera: '200MP + 50MP + 12MP + 10MP',
    ram: '12GB',
    storage: '256GB',
    colors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet'],
    features: ['5G', 'S Pen', 'Galaxy AI'],
    tags: ['samsung', 'ultra', 'galaxy'],
    specifications: {
      chip: 'Snapdragon 8 Gen 3',
      os: 'Android 14',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API Samsung Galaxy A55',
    brand: 'Samsung',
    description: 'Mid-range Samsung sample with balanced specs for testing.',
    price: 9990000,
    originalPrice: 10990000,
    countInStock: 24,
    screen: '6.6 inch Super AMOLED',
    battery: '5000mAh',
    camera: '50MP + 12MP + 5MP',
    ram: '8GB',
    storage: '128GB',
    colors: ['Awesome Navy', 'Awesome Iceblue', 'Awesome Lilac'],
    features: ['5G', 'AMOLED', '5000mAh'],
    tags: ['samsung', 'galaxy-a', 'midrange'],
    specifications: {
      chip: 'Exynos 1480',
      os: 'Android 14',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API Xiaomi 14',
    brand: 'Xiaomi',
    description: 'Compact Xiaomi sample phone for search and product detail testing.',
    price: 21990000,
    originalPrice: 23990000,
    countInStock: 13,
    screen: '6.36 inch AMOLED',
    battery: '4610mAh',
    camera: '50MP + 50MP + 50MP',
    ram: '12GB',
    storage: '256GB',
    colors: ['Black', 'White', 'Jade Green'],
    features: ['5G', 'Leica Camera', 'AMOLED'],
    tags: ['xiaomi', 'flagship', 'android'],
    specifications: {
      chip: 'Snapdragon 8 Gen 3',
      os: 'HyperOS',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API Redmi Note 13 Pro',
    brand: 'Xiaomi',
    description: 'Popular Xiaomi sample phone for pagination and filtering tests.',
    price: 8490000,
    originalPrice: 9490000,
    countInStock: 28,
    screen: '6.67 inch AMOLED',
    battery: '5100mAh',
    camera: '200MP + 8MP + 2MP',
    ram: '8GB',
    storage: '256GB',
    colors: ['Midnight Black', 'Aurora Purple', 'Ocean Teal'],
    features: ['5G', 'AMOLED', 'Fast Charge'],
    tags: ['xiaomi', 'redmi', 'note'],
    specifications: {
      chip: 'Snapdragon 7s Gen 2',
      os: 'HyperOS',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API OPPO Reno11 F',
    brand: 'OPPO',
    description: 'OPPO sample device for category and brand API tests.',
    price: 8990000,
    originalPrice: 9990000,
    countInStock: 19,
    screen: '6.7 inch AMOLED',
    battery: '5000mAh',
    camera: '64MP + 8MP + 2MP',
    ram: '8GB',
    storage: '256GB',
    colors: ['Palm Green', 'Ocean Blue', 'Coral Purple'],
    features: ['5G', 'AMOLED', '67W Charge'],
    tags: ['oppo', 'reno', 'android'],
    specifications: {
      chip: 'Dimensity 7050',
      os: 'ColorOS 14',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API vivo V30',
    brand: 'vivo',
    description: 'Vivo sample phone with clean field coverage for testing.',
    price: 10490000,
    originalPrice: 11490000,
    countInStock: 21,
    screen: '6.78 inch AMOLED',
    battery: '5000mAh',
    camera: '50MP + 50MP',
    ram: '12GB',
    storage: '256GB',
    colors: ['Bloom White', 'Waving Aqua', 'Lush Green'],
    features: ['5G', 'AMOLED', 'Portrait Camera'],
    tags: ['vivo', 'v-series', 'android'],
    specifications: {
      chip: 'Snapdragon 7 Gen 3',
      os: 'Funtouch OS 14',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API realme 12 Pro Plus',
    brand: 'realme',
    description: 'Realme sample product for API smoke tests and demos.',
    price: 11990000,
    originalPrice: 12990000,
    countInStock: 16,
    screen: '6.7 inch AMOLED',
    battery: '5000mAh',
    camera: '50MP + 64MP + 8MP',
    ram: '12GB',
    storage: '256GB',
    colors: ['Navigator Beige', 'Submarine Blue', 'Explorer Red'],
    features: ['5G', 'Periscope', '67W Charge'],
    tags: ['realme', 'pro-plus', 'android'],
    specifications: {
      chip: 'Snapdragon 7s Gen 2',
      os: 'realme UI 5',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API iPhone 14',
    brand: 'Apple',
    description: 'Older generation iPhone sample for mixed catalog testing.',
    price: 15990000,
    originalPrice: 17990000,
    countInStock: 18,
    screen: '6.1 inch Super Retina XDR',
    battery: '3279mAh',
    camera: '12MP + 12MP',
    ram: '6GB',
    storage: '128GB',
    colors: ['Midnight', 'Starlight', 'Blue'],
    features: ['5G', 'Face ID', 'Dual Camera'],
    tags: ['iphone', 'apple', 'catalog'],
    specifications: {
      chip: 'A15 Bionic',
      os: 'iOS 18',
      refreshRate: '60Hz',
    },
  },
  {
    name: 'Sample API Samsung Galaxy Z Flip5',
    brand: 'Samsung',
    description: 'Foldable Samsung sample for unique catalog scenarios.',
    price: 19990000,
    originalPrice: 22990000,
    countInStock: 9,
    screen: '6.7 inch Foldable AMOLED',
    battery: '3700mAh',
    camera: '12MP + 12MP',
    ram: '8GB',
    storage: '256GB',
    colors: ['Mint', 'Graphite', 'Lavender'],
    features: ['5G', 'Foldable', 'AMOLED'],
    tags: ['samsung', 'flip', 'foldable'],
    specifications: {
      chip: 'Snapdragon 8 Gen 2',
      os: 'Android 14',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API POCO X6 Pro',
    brand: 'Xiaomi',
    description: 'Gaming-focused Xiaomi sample for price filter testing.',
    price: 8990000,
    originalPrice: 9990000,
    countInStock: 26,
    screen: '6.67 inch AMOLED',
    battery: '5000mAh',
    camera: '64MP + 8MP + 2MP',
    ram: '12GB',
    storage: '512GB',
    colors: ['Black', 'Yellow', 'Gray'],
    features: ['5G', 'AMOLED', 'Gaming'],
    tags: ['poco', 'xiaomi', 'gaming'],
    specifications: {
      chip: 'Dimensity 8300 Ultra',
      os: 'HyperOS',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API OPPO Find N3 Flip',
    brand: 'OPPO',
    description: 'Foldable OPPO sample to test diverse product catalogs.',
    price: 22990000,
    originalPrice: 24990000,
    countInStock: 8,
    screen: '6.8 inch Foldable AMOLED',
    battery: '4300mAh',
    camera: '50MP + 48MP + 32MP',
    ram: '12GB',
    storage: '256GB',
    colors: ['Cream Gold', 'Sleek Black', 'Misty Pink'],
    features: ['5G', 'Foldable', 'Hasselblad'],
    tags: ['oppo', 'find', 'foldable'],
    specifications: {
      chip: 'Dimensity 9200',
      os: 'ColorOS 14',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API vivo X100',
    brand: 'vivo',
    description: 'Premium vivo sample with strong camera specifications.',
    price: 19990000,
    originalPrice: 21990000,
    countInStock: 10,
    screen: '6.78 inch AMOLED',
    battery: '5000mAh',
    camera: '50MP + 64MP + 50MP',
    ram: '12GB',
    storage: '256GB',
    colors: ['Asteroid Black', 'Startrail Blue', 'Orange'],
    features: ['5G', 'ZEISS Camera', 'Fast Charge'],
    tags: ['vivo', 'x-series', 'camera'],
    specifications: {
      chip: 'Dimensity 9300',
      os: 'Funtouch OS 14',
      refreshRate: '120Hz',
    },
  },
  {
    name: 'Sample API realme C67',
    brand: 'realme',
    description: 'Affordable realme sample for low-price catalog testing.',
    price: 4590000,
    originalPrice: 5290000,
    countInStock: 32,
    screen: '6.72 inch IPS LCD',
    battery: '5000mAh',
    camera: '108MP + 2MP',
    ram: '8GB',
    storage: '128GB',
    colors: ['Sunny Oasis', 'Black Rock', 'Lake Green'],
    features: ['4G', '5000mAh', 'Budget'],
    tags: ['realme', 'budget', 'c-series'],
    specifications: {
      chip: 'Snapdragon 685',
      os: 'realme UI 5',
      refreshRate: '90Hz',
    },
  },
  {
    name: 'Sample API Nokia G42',
    brand: 'Nokia',
    description: 'Nokia sample phone for broader brand coverage in the API.',
    price: 3990000,
    originalPrice: 4590000,
    countInStock: 22,
    screen: '6.56 inch IPS LCD',
    battery: '5000mAh',
    camera: '50MP + 2MP + 2MP',
    ram: '6GB',
    storage: '128GB',
    colors: ['Purple', 'Gray', 'Pink'],
    features: ['5G', 'Budget', 'Repair Friendly'],
    tags: ['nokia', 'budget', 'android'],
    specifications: {
      chip: 'Snapdragon 480 Plus',
      os: 'Android 14',
      refreshRate: '90Hz',
    },
  },
  {
    name: 'Sample API ASUS ROG Phone 8',
    brand: 'ASUS',
    description: 'Gaming flagship sample with strong specs for API testing.',
    price: 24990000,
    originalPrice: 27990000,
    countInStock: 7,
    screen: '6.78 inch AMOLED',
    battery: '5500mAh',
    camera: '50MP + 13MP + 32MP',
    ram: '16GB',
    storage: '512GB',
    colors: ['Phantom Black', 'Rebel Gray', 'Glow White'],
    features: ['5G', 'Gaming', '165Hz'],
    tags: ['asus', 'rog', 'gaming'],
    specifications: {
      chip: 'Snapdragon 8 Gen 3',
      os: 'Android 14',
      refreshRate: '165Hz',
    },
  },
  {
    name: 'Sample API Google Pixel 8',
    brand: 'Google',
    description: 'Google Pixel sample for search and brand filter coverage.',
    price: 17990000,
    originalPrice: 19990000,
    countInStock: 12,
    screen: '6.2 inch OLED',
    battery: '4575mAh',
    camera: '50MP + 12MP',
    ram: '8GB',
    storage: '128GB',
    colors: ['Obsidian', 'Hazel', 'Rose'],
    features: ['5G', 'AI Camera', 'OLED'],
    tags: ['google', 'pixel', 'android'],
    specifications: {
      chip: 'Google Tensor G3',
      os: 'Android 14',
      refreshRate: '120Hz',
    },
  },
];

const buildProductPayload = (item) => {
  const slug = toSlug(item.name);

  return {
    ...item,
    slug,
    image: createImage(item.name, 'Cover'),
    images: [
      createImage(item.name, 'Front'),
      createImage(item.name, 'Back'),
      createImage(item.name, 'Display'),
    ],
    category: 'Smartphone',
    status: 'active',
    tags: [...new Set([...(item.tags || []), SAMPLE_TAG, SAMPLE_BATCH])],
  };
};

const buildVariants = (product) => {
  const primaryColor = product.colors[0] || 'Black';
  const secondaryColor = product.colors[1] || primaryColor;
  const secondaryStorage = alternateStorage(product.storage);

  return [
    {
      product: product._id,
      sku: buildSku(product.slug, product.storage, primaryColor, 'STD'),
      color: primaryColor,
      storage: product.storage,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: Math.max(Math.floor(product.countInStock / 2), 4),
      image: product.images[0] || product.image,
      images: product.images,
      attributes: {
        ram: product.ram,
        screen: product.screen,
        battery: product.battery,
      },
      isActive: true,
    },
    {
      product: product._id,
      sku: buildSku(product.slug, secondaryStorage, secondaryColor, 'PLUS'),
      color: secondaryColor,
      storage: secondaryStorage,
      price: product.price + 1500000,
      originalPrice: product.originalPrice + 2000000,
      stock: Math.max(Math.floor(product.countInStock / 2) - 1, 3),
      image: product.images[1] || product.image,
      images: product.images,
      attributes: {
        ram: product.ram,
        screen: product.screen,
        battery: product.battery,
      },
      isActive: true,
    },
  ];
};

const seedProducts = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in backend/.env');
  }

  if (sampleProducts.length !== 20) {
    throw new Error(`Expected 20 sample products, received ${sampleProducts.length}`);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  const desiredSlugs = sampleProducts.map((item) => toSlug(item.name));
  const staleProducts = await Product.find({
    tags: SAMPLE_BATCH,
    slug: { $nin: desiredSlugs },
  }).select('_id');

  if (staleProducts.length) {
    const staleProductIds = staleProducts.map((product) => product._id);

    await ProductVariant.deleteMany({
      product: { $in: staleProductIds },
    });

    await Product.deleteMany({
      _id: { $in: staleProductIds },
    });
  }

  const upsertedProducts = [];

  for (const item of sampleProducts) {
    const payload = buildProductPayload(item);
    const product = await Product.findOneAndUpdate(
      { slug: payload.slug },
      { $set: payload },
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    upsertedProducts.push(product);
  }

  let variantCount = 0;
  const desiredSkus = [];

  for (const product of upsertedProducts) {
    const variants = buildVariants(product);

    for (const variant of variants) {
      desiredSkus.push(variant.sku);

      await ProductVariant.findOneAndUpdate(
        { sku: variant.sku },
        { $set: variant },
        {
          upsert: true,
          returnDocument: 'after',
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      variantCount += 1;
    }
  }

  await ProductVariant.deleteMany({
    $and: [
      { sku: { $regex: /^SAMPLE-API-/i } },
      { sku: { $nin: desiredSkus } },
    ],
  });

  const totalProducts = await Product.countDocuments({ tags: SAMPLE_BATCH });
  const totalVariants = await ProductVariant.countDocuments({
    sku: { $in: desiredSkus },
  });

  console.log(`Seeded ${upsertedProducts.length} sample products.`);
  console.log(`Upserted ${variantCount} sample variants.`);
  console.log(`Current sample products in DB: ${totalProducts}`);
  console.log(`Current sample variants in DB: ${totalVariants}`);
  console.log('First 5 sample product names:');

  upsertedProducts.slice(0, 5).forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} (${product._id})`);
  });
};

seedProducts()
  .catch((error) => {
    console.error('Seed sample products failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
