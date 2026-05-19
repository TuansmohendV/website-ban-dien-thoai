import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function simulateAggregation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const userId = '69fd940f4a28c1cab7a195cd'; // Mai Thanh Tuấn
    
    console.log(`Checking orders for user: ${userId}`);
    const orders = await Order.find({ user: userId });
    console.log(`Found ${orders.length} orders manually.`);

    const years = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $year: '$createdAt' },
          count: { $sum: 1 },
          totalSpent: { $sum: '$total' }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    console.log('Aggregation result:');
    console.log(JSON.stringify(years, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

simulateAggregation();
