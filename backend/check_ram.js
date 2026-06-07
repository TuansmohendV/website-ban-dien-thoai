import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function checkData() {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({ ram: /8GB/i });
  console.log(`Found ${products.length} products with RAM 8GB`);
  products.forEach(p => {
    console.log(`- ID: ${p._id}, Name: ${p.name}, RAM: "${p.ram}"`);
  });
  process.exit();
}

checkData();
