import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const Product = mongoose.model('Product', new mongoose.Schema({ category: String }));

async function audit() {
  await mongoose.connect(process.env.MONGODB_URI);
  const stats = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  console.log('Category Distribution:');
  stats.forEach(s => {
    console.log(`- ${s._id || 'Uncategorized'}: ${s.count} products`);
  });
  await mongoose.disconnect();
}

audit();
