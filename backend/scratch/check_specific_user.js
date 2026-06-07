import mongoose from 'mongoose';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkSpecificUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const userId = '69fd9faaf4061f9d57c28be2'; 
    const count = await Order.countDocuments({ user: userId });
    console.log(`Order count for ${userId}: ${count}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkSpecificUser();
