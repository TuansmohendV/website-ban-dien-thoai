import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';

dotenv.config({ path: './backend/.env' });

const checkStock = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({ status: 'active' }).limit(5).lean();
        
        for (const p of products) {
            const variants = await ProductVariant.find({ product: p._id, isActive: true }).lean();
            const totalStock = variants.length > 0 
                ? variants.reduce((sum, v) => sum + v.stock, 0) 
                : p.countInStock;
            
            console.log(`Product: ${p.name}`);
            console.log(`  - countInStock (Model): ${p.countInStock}`);
            console.log(`  - Variants found: ${variants.length}`);
            if (variants.length > 0) {
                variants.forEach(v => console.log(`    * Variant ${v.color || ''} ${v.storage || ''}: ${v.stock}`));
            }
            console.log(`  - Calculated Total Stock: ${totalStock}`);
            console.log('---');
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkStock();
