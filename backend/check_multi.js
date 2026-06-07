import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const baseFilter = { status: 'active' };
  const count8 = await Product.countDocuments({ ...baseFilter, ram: /8GB/i });
  const count12 = await Product.countDocuments({ ...baseFilter, ram: /12GB/i });
  const countBoth = await Product.countDocuments({ 
    ...baseFilter,
    $or: [
      { ram: /8GB/i },
      { ram: /12GB/i }
    ]
  });
  const countIn = await Product.countDocuments({ 
    ...baseFilter,
    ram: { $in: [/8GB/i, /12GB/i] }
  });
  
  console.log('Active 8GB:', count8);
  console.log('Active 12GB:', count12);
  console.log('Active Both ($or):', countBoth);
  console.log('Active Both ($in):', countIn);
  process.exit();
}
check();
