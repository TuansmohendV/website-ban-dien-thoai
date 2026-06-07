import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkFieldTypes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const order = await Order.findOne({ user: { $exists: true } });
    if (order) {
        console.log(`Order ID: ${order._id}`);
        console.log(`User field: ${order.user}`);
        console.log(`User field type: ${typeof order.user}`);
        console.log(`Is User field ObjectId? ${order.user instanceof mongoose.Types.ObjectId}`);
    } else {
        console.log('No orders with user field found.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkFieldTypes();
