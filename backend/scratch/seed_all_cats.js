import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  isActive: { type: Boolean, default: true }
}, { strict: false });

const Category = mongoose.model('Category', categorySchema);

const toSlug = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

async function seedAllCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const catNames = [
      'Điện thoại', 'Laptop', 'Tablet', 'Màn hình', 'Linh kiện máy tính',
      'Tivi, Điện máy', 'Đồng hồ', 'Âm thanh', 'Smart home', 'Phụ kiện',
      'Sửa chữa', 'Dịch vụ', 'Hàng cũ', 'Thu cũ đổi mới', 'Tin công nghệ', 'Khuyến mãi hot'
    ];

    for (const name of catNames) {
      const slug = toSlug(name);
      const existing = await Category.findOne({ slug });
      if (!existing) {
        console.log(`Adding category: ${name} (${slug})`);
        await Category.create({ name, slug, isActive: true });
      } else {
        console.log(`Category exists: ${name}`);
      }
    }

    console.log('Finished seeding categories.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

seedAllCategories();
