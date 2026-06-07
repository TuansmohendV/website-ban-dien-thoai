import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const Category = mongoose.model('Category', new mongoose.Schema({ name: String, slug: String }));

const brandsToRemove = [
  'Samsung', 'OPPO', 'Xiaomi', 'Realme', 'iPhone', 'Vivo', 'Apple', 
  'Smartphone', 'Gaming Phone', 'Vsmart', 'Nokia', 'Masstel', 'Itel'
];

async function removeBrandCategories() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const name of brandsToRemove) {
    const result = await Category.deleteMany({ 
      $or: [
        { name: new RegExp(`^${name}$`, 'i') },
        { slug: new RegExp(`^${name}$`, 'i') }
      ]
    });
    if (result.deletedCount > 0) {
      console.log(`Removed category: ${name}`);
    }
  }

  console.log('Finished cleaning up brand categories.');
  await mongoose.disconnect();
}

removeBrandCategories();
