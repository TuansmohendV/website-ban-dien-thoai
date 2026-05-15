import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  brand: String,
  tags: [String],
  features: [String],
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

const resolveStandardCategory = (product) => {
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

  // 1. Check for Phones first (but be careful with Laptop keywords)
  // Exception: "ROG Phone" is a phone, not a laptop
  if (
    (/(iphone|smartphone|dien-thoai|dien thoai|galaxy|redmi|xiaomi|oppo|vivo|realme|nokia|honor|huawei|fold|flip|phone)/.test(searchableText)) && 
    (!/(laptop|macbook|ipad|tablet|watch|dong-ho)/.test(searchableText) || searchableText.includes('phone'))
  ) {
    return 'dien-thoai';
  }

  if (/(macbook|laptop|notebook|vivobook|zenbook|rog|legion|thinkpad|ideapad)/.test(searchableText)) {
    return 'laptop';
  }
  if (/(ipad|tablet|galaxy-tab|galaxy tab|tab )/.test(searchableText)) {
    return 'tablet';
  }
  if (/(watch|dong-ho|dong ho|smartwatch|garmin|apple watch|galaxy watch)/.test(searchableText)) {
    return 'dong-ho';
  }
  if (/(airpods|tai-nghe|tai nghe|earbud|headphone|loa|speaker|audio|am-thanh|am thanh|galaxy buds)/.test(searchableText)) {
    return 'am-thanh';
  }
  if (/(man-hinh|man hinh|monitor|display)/.test(searchableText)) {
    return 'man-hinh';
  }
  
  return null;
};

async function fixCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      const standardCat = resolveStandardCategory(product);
      if (standardCat && product.category !== standardCat) {
        console.log(`Updating ${product.name}: ${product.category} -> ${standardCat}`);
        product.category = standardCat;
        await product.save();
        updatedCount++;
      }
    }

    console.log(`Finished! Updated ${updatedCount} products.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

fixCategories();
