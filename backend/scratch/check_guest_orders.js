import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkGuestOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const guestOrders = await Order.find({ user: { $exists: false } }).sort({ createdAt: -1 });
    console.log(`Found ${guestOrders.length} guest orders:`);
    for (const order of guestOrders) {
        console.log(`Order ID: ${order._id} - Email: ${order.customerInfo?.email} - Name: ${order.customerInfo?.fullName}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkGuestOrders();
