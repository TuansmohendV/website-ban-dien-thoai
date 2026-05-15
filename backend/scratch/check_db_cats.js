import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
}, { strict: false });

const Category = mongoose.model('Category', categorySchema);

async function checkCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const categories = await Category.find({}).lean();
    console.log('Categories in DB:', JSON.stringify(categories, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCategories();
