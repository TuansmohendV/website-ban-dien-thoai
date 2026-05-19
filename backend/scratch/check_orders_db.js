import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`Found ${orders.length} recent orders:`);
    
    orders.forEach(order => {
      console.log('---');
      console.log(`ID: ${order._id}`);
      console.log(`User ID: ${order.user}`);
      console.log(`Guest ID: ${order.guestId}`);
      console.log(`Customer: ${order.customerInfo?.fullName} (${order.customerInfo?.email})`);
      console.log(`Status: ${order.status}`);
      console.log(`Created At: ${order.createdAt}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkOrders();
