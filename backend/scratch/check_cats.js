import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  status: String,
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function checkCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const categories = await Product.distinct('category');
    console.log('Unique categories in DB:', categories);

    const laptopCount = await Product.countDocuments({ category: /laptop/i });
    console.log('Products with category matching "laptop":', laptopCount);

    const firstLaptop = await Product.findOne({ category: /laptop/i });
    if (firstLaptop) {
      console.log('Sample laptop:', JSON.stringify(firstLaptop, null, 2));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCategories();
