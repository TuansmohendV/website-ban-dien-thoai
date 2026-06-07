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
  tags: [String]
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function seedVariety() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = [
      // TABLETS
      {
        name: 'iPad Pro M4 11 inch (2024)',
        category: 'tablet',
        brand: 'Apple',
        price: 28990000,
        image: 'https://cdn.hoanghamobile.vn/Uploads/2024/05/08/ipad-pro-m4-11-wifi-silver-1_638507727402685012.png',
        status: 'active',
        isHot: true,
        tags: ['iPad', 'M4', 'Tablet']
      },
      {
        name: 'Samsung Galaxy Tab S9 FE',
        category: 'tablet',
        brand: 'Samsung',
        price: 9490000,
        image: 'https://cdn.hoanghamobile.vn/Uploads/2023/10/10/galaxy-tab-s9-fe-5g-1.jpg',
        status: 'active',
        isHot: true,
        tags: ['Samsung', 'Tab S9', 'Tablet']
      },
      // SMARTWATCHES
      {
        name: 'Apple Watch Series 9 GPS 41mm',
        category: 'dong-ho',
        brand: 'Apple',
        price: 9490000,
        image: 'https://cdn.hoanghamobile.vn/Uploads/2023/09/13/apple-watch-s9-midnight-41mm-1.png',
        status: 'active',
        isHot: true,
        tags: ['Apple Watch', 'Series 9']
      },
      {
        name: 'Huawei Watch GT 4 46mm',
        category: 'dong-ho',
        brand: 'Huawei',
        price: 4990000,
        image: 'https://cdn.hoanghamobile.vn/Uploads/2023/10/05/huawei-watch-gt-4-46mm-black-1.jpg',
        status: 'active',
        isHot: true,
        tags: ['Huawei', 'Watch GT 4']
      },
      // AUDIO
      {
        name: 'AirPods Pro 2 (USB-C) 2023',
        category: 'am-thanh',
        brand: 'Apple',
        price: 5490000,
        image: 'https://cdn.hoanghamobile.vn/Uploads/2023/09/13/airpods-pro-2-usb-c-1.png',
        status: 'active',
        isHot: true,
        tags: ['AirPods', 'Apple']
      },
      {
        name: 'Loa Bluetooth Marshall Emberton II',
        category: 'am-thanh',
        brand: 'Marshall',
        price: 4490000,
        image: 'https://cdn.hoanghamobile.vn/Uploads/2022/05/19/marshall-emberton-ii-black-and-brass-1.jpg',
        status: 'active',
        isHot: true,
        tags: ['Marshall', 'Speaker']
      },
      // MONITORS
      {
        name: 'Màn hình ASUS ProArt PA248QV 24 inch',
        category: 'man-hinh',
        brand: 'ASUS',
        price: 4990000,
        image: 'https://cdn.hoanghamobile.vn/Uploads/2020/07/20/pa248qv-1.jpg',
        status: 'active',
        isHot: true,
        tags: ['ASUS', 'Monitor', 'ProArt']
      },
      {
        name: 'Màn hình Gaming Samsung Odyssey G3 24 inch',
        category: 'man-hinh',
        brand: 'Samsung',
        price: 3690000,
        image: 'https://cdn.hoanghamobile.vn/Uploads/2021/08/24/odyssey-g3-24.jpg',
        status: 'active',
        isHot: true,
        tags: ['Samsung', 'Gaming', 'Monitor']
      }
    ];

    await Product.insertMany(products);
    console.log('Inserted variety of products across categories');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

seedVariety();
