import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const Category = mongoose.model('Category', new mongoose.Schema({ name: String, slug: String }));

const correctSlugs = {
  'ien-thoai': 'dien-thoai',
  'ong-ho': 'dong-ho',
  'sua-chua': 'sua-chua', // This one is actually correct since 's' is okay
  'tivi-ien-may': 'tivi-dien-may',
  'thu-cu-oi-moi': 'thu-cu-doi-moi'
};

async function fixSlugs() {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const [oldSlug, newSlug] of Object.entries(correctSlugs)) {
    const cat = await Category.findOne({ slug: oldSlug });
    if (cat) {
      console.log(`Fixing slug: ${oldSlug} -> ${newSlug}`);
      cat.slug = newSlug;
      await cat.save();
    }
  }
  await mongoose.disconnect();
}

fixSlugs();
