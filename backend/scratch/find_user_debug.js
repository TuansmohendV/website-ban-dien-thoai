import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function searchAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ fullName: { $exists: true } });
    console.log(`Found ${users.length} users with fullName:`);
    for (const user of users) {
        if (user.fullName.includes('Khánh') || user.fullName.includes('Hằng')) {
            console.log(`MATCH -> User: ${user.fullName} (${user.email || user.phone}) - Role: ${user.role} - ID: ${user._id}`);
        }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

searchAll();
