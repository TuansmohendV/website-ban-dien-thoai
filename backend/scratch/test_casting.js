import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testCasting() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const userId = '69fd940f4a28c1cab7a195cd'; // Mai Thanh Tuấn
    
    // Simulate what happens in the controller where req.user._id is an ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log('Testing aggregation WITHOUT manual casting (passing ObjectId object)...');
    const result1 = await Order.aggregate([
      { $match: { user: userObjectId } },
      { $group: { _id: { $year: '$createdAt' }, count: { $sum: 1 } } }
    ]);
    console.log('Result 1:', result1);

    console.log('Testing aggregation WITH manual casting (passing ObjectId object)...');
    const result2 = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userObjectId) } },
      { $group: { _id: { $year: '$createdAt' }, count: { $sum: 1 } } }
    ]);
    console.log('Result 2:', result2);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testCasting();
