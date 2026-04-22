import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const DEFAULT_ADMIN = {
  fullName: 'System Admin',
  email: 'admin@mobileshop.local',
  phone: '0900009999',
  password: 'Admin@123456',
  gender: 'other',
  role: 'admin',
  isActive: true,
};

const seedAdminUser = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in backend/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  let admin = await User.findOne({ email: DEFAULT_ADMIN.email }).select('+password');

  if (!admin) {
    admin = await User.create(DEFAULT_ADMIN);
  } else {
    admin.fullName = DEFAULT_ADMIN.fullName;
    admin.phone = DEFAULT_ADMIN.phone;
    admin.gender = DEFAULT_ADMIN.gender;
    admin.role = 'admin';
    admin.isActive = true;

    const passwordMatched = await admin.comparePassword(DEFAULT_ADMIN.password);

    if (!passwordMatched) {
      admin.password = DEFAULT_ADMIN.password;
    }

    await admin.save();
  }

  console.log(
    JSON.stringify(
      {
        message: 'Default admin is ready.',
        email: DEFAULT_ADMIN.email,
        password: DEFAULT_ADMIN.password,
        role: admin.role,
        isActive: admin.isActive,
      },
      null,
      2
    )
  );
};

seedAdminUser()
  .catch((error) => {
    console.error('Seed admin failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
