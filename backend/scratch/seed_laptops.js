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
  specifications: Object,
  isHot: Boolean,
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function seedLaptops() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const laptops = [
      {
        name: 'MacBook Air M3 13 inch 2024',
        category: 'laptop',
        brand: 'Apple',
        price: 27990000,
        image: 'https://cdn.hoanghamobile.vn/Uploads/2024/03/13/macbook-air-m3-spacegray_638459637841162391.png',
        status: 'active',
        isHot: true,
        specifications: { ram: '8GB', rom: '256GB SSD', cpu: 'Apple M3' }
      },
      {
        name: 'Laptop ASUS Vivobook Go 15',
        category: 'laptop',
        brand: 'ASUS',
        price: 11490000,
        image: 'https://cdn.hoanghamobile.vn/Uploads/2023/06/15/asus-vivobook-go-15-e1504ga-nj032w-02.jpg',
        status: 'active',
        isHot: true,
        specifications: { ram: '8GB', rom: '256GB SSD', cpu: 'Intel Core i3' }
      }
    ];

    await Product.insertMany(laptops);
    console.log('Inserted sample laptops');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

seedLaptops();
