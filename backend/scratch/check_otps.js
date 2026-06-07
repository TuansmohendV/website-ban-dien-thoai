import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkAdminUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Find all admin/manager accounts
    const admins = await db.collection('users').find(
      { role: { $in: ['admin', 'manager', 'staff'] } },
      { projection: { email: 1, phone: 1, fullName: 1, role: 1, authProvider: 1 } }
    ).toArray();
    
    console.log(`Admin/Manager/Staff accounts (${admins.length} total):`);
    admins.forEach(u => console.log(`  - ${u.email || u.phone} | ${u.fullName} | role: ${u.role} | provider: ${u.authProvider}`));

    // Check the specific email
    const target = await db.collection('users').findOne(
      { email: 'maithanhtuan22t@gmail.com' },
      { projection: { email: 1, fullName: 1, role: 1, authProvider: 1, isActive: 1 } }
    );
    console.log('\nTarget user (maithanhtuan22t@gmail.com):');
    console.log(JSON.stringify(target, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdminUsers();
