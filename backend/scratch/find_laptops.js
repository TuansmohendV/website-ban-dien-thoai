import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function findLaptopsByName() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const potentialLaptops = await Product.find({
      name: { $regex: /laptop|macbook|dell|hp|asus|acer|lenovo|thinkpad|msi/i }
    }).limit(10).lean();

    console.log('Found potential laptops by name:', potentialLaptops.length);
    potentialLaptops.forEach(p => {
      console.log(`- ${p.name} (Category: ${p.category})`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

findLaptopsByName();
