import mongoose from 'mongoose';
import { toSlug } from '../utils/slug.js';

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

brandSchema.pre('validate', function buildSlug(next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = toSlug(this.name);
  }

  next();
});

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
