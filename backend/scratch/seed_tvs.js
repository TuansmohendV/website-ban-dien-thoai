import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  brand: String,
  price: Number,
  image: String,
  status: String,
  isHot: Boolean,
  tags: [String]
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function seedTVs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const tvs = [
      {
        name: 'Smart TV Samsung Crystal UHD 4K 55 inch UA55AU7700',
        category: 'tivi-dien-may',
        brand: 'Samsung',
        price: 9990000,
        image: 'https://cdn.hoanghamobile.vn/Uploads/2021/05/13/tivi-samsung-55-inch.png',
        status: 'active',
        isHot: true,
        tags: ['TV', 'Samsung', '4K']
      },
      {
        name: 'Android TV Sony 4K 50 inch KD-50X75K',
        category: 'tivi-dien-may',
        brand: 'Sony',
        price: 11490000,
        image: 'https://cdn.hoanghamobile.vn/Uploads/2022/05/20/sony-kd-50x75k.jpg',
        status: 'active',
        isHot: true,
        tags: ['TV', 'Sony', 'Android TV']
      },
      {
        name: 'Máy giặt LG Inverter 9kg FV1409S4W',
        category: 'tivi-dien-may',
        brand: 'LG',
        price: 8490000,
        image: 'https://cdn.hoanghamobile.vn/Uploads/2020/09/24/may-giat-lg.jpg',
        status: 'active',
        isHot: true,
        tags: ['Washing Machine', 'LG', 'Appliance']
      }
    ];

    await Product.insertMany(tvs);
    console.log('Inserted sample TVs and Appliances');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

seedTVs();
