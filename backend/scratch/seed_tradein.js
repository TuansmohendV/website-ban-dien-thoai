import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import TradeInDevice from '../models/TradeInDevice.js';

const devices = [
    { brand: 'Apple', model: 'iPhone 15 Pro Max', basePrice: 25000000 },
    { brand: 'Apple', model: 'iPhone 15 Pro', basePrice: 22000000 },
    { brand: 'Apple', model: 'iPhone 14 Pro Max', basePrice: 18000000 },
    { brand: 'Apple', model: 'iPhone 13 Pro Max', basePrice: 15000000 },
    { brand: 'Samsung', model: 'Galaxy S24 Ultra', basePrice: 23000000 },
    { brand: 'Samsung', model: 'Galaxy S23 Ultra', basePrice: 18000000 },
    { brand: 'Xiaomi', model: 'Xiaomi 14 Ultra', basePrice: 17000000 },
    { brand: 'Oppo', model: 'Find N3', basePrice: 20000000 },
    { brand: 'Google', model: 'Pixel 8 Pro', basePrice: 16000000 },
];

const seedTradeIn = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        await TradeInDevice.deleteMany();
        await TradeInDevice.insertMany(devices);
        
        console.log('Seed trade-in devices success');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedTradeIn();
