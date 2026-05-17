import mongoose from 'mongoose';
import { toSlug } from '../utils/slug.js';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, trim: true, unique: true, sparse: true },
    image: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    brand: { type: String, required: true, trim: true },
    brandRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    category: { type: String, default: 'Smartphone', trim: true },
    categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    originalPrice: { type: Number, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    screen: { type: String, default: '' },
    battery: { type: String, default: '' },
    camera: { type: String, default: '' },
    ram: { type: String, default: '' },
    storage: { type: String, default: '' },
    colors: { type: [String], default: [] },
    features: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    videoUrl: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

productSchema.pre('validate', function buildSlug() {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = toSlug(this.name);
  }
});

productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  category: 'text',
  tags: 'text',
});
productSchema.index({ brand: 1, category: 1, price: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
