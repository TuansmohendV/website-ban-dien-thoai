import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkUsersAndOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}).limit(10);
    console.log(`Found ${users.length} users:`);
    for (const user of users) {
        const orderCount = await Order.countDocuments({ user: user._id });
        console.log(`User: ${user.fullName} (${user.email}) - ID: ${user._id} - Orders: ${orderCount}`);
    }

    const guestOrders = await Order.countDocuments({ user: { $exists: false } });
    console.log(`Guest Orders: ${guestOrders}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsersAndOrders();
