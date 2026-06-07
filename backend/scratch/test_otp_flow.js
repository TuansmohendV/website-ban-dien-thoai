import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testOTPFlow() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const testEmail = 'maithanhtuan22t@gmail.com';
    
    // Step 1: Simulate creating OTP
    const otp = '123456'; // fixed for testing
    await db.collection('otps').deleteMany({ email: testEmail });
    const inserted = await db.collection('otps').insertOne({
      email: testEmail,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: new Date()
    });
    console.log('Step 1 - Created OTP in DB:', inserted.insertedId);
    
    // Step 2: Find OTP (simulate verifyOTP)
    const found = await db.collection('otps').findOne({
      email: testEmail,
      otp: otp,
      expiresAt: { $gt: new Date() }
    });
    console.log('Step 2 - OTP found:', found ? 'YES ✓' : 'NO ✗');
    if (!found) {
      console.log('PROBLEM: OTP not found in verify step!');
    }
    
    // Step 3: Simulate otp-login (find or create user)
    const User = mongoose.model('User', new mongoose.Schema({
      fullName: String, email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
      phone: { type: String, unique: true, sparse: true },
      password: { type: String, required: true, minlength: 6 },
      authProvider: { type: String, enum: ['local', 'google', 'facebook', 'firebase', 'email_otp'], default: 'local' },
      role: { type: String, default: 'customer' },
      isActive: { type: Boolean, default: true },
      referralCode: { type: String, unique: true, sparse: true },
      firebaseUid: { type: String, unique: true, sparse: true },
      lastLoginAt: Date,
      avatar: String, gender: String, dateOfBirth: Date,
    }, { strict: false }));

    let user = await User.findOne({ email: testEmail });
    console.log('\nStep 3 - User exists:', user ? `YES (id: ${user._id})` : 'NO (will create)');
    
    if (!user) {
      try {
        user = await User.create({
          email: testEmail,
          fullName: 'Khách hàng',
          password: crypto.randomBytes(16).toString('hex'),
          authProvider: 'email_otp',
        });
        console.log('User created:', user._id);
      } catch (createErr) {
        console.error('PROBLEM creating user:', createErr.code, createErr.message);
      }
    }

    if (user) {
      try {
        user.lastLoginAt = new Date();
        await user.save({ validateBeforeSave: false });
        console.log('Step 4 - user.save() SUCCESS ✓');
      } catch (saveErr) {
        console.error('PROBLEM in user.save():', saveErr.code, saveErr.message);
      }
    }

    // Cleanup
    await db.collection('otps').deleteMany({ email: testEmail });
    await mongoose.disconnect();
    console.log('\nTest complete.');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

testOTPFlow();
