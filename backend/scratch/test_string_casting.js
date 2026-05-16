import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testStringCasting() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const userId = '69fd940f4a28c1cab7a195cd'; 
    
    console.log('Testing aggregation with STRING userId...');
    const result = await Order.aggregate([
      { $match: { user: userId } },
      { $group: { _id: { $year: '$createdAt' }, count: { $sum: 1 } } }
    ]);
    console.log('Result:', result);

    console.log('Testing aggregation with manual casting of STRING userId...');
    const result2 = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: { $year: '$createdAt' }, count: { $sum: 1 } } }
    ]);
    console.log('Result 2:', result2);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testStringCasting();
