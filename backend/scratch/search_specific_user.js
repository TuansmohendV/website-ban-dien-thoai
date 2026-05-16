import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function searchUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ fullName: { $regex: 'Khánh|Hằng', $options: 'i' } });
    console.log(`Found ${users.length} users:`);
    for (const user of users) {
        console.log(`User: ${user.fullName} (${user.email || user.phone}) - Role: ${user.role} - ID: ${user._id}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

searchUsers();
