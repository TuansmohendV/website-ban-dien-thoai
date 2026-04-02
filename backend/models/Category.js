import mongoose from 'mongoose';
import { toSlug } from '../utils/slug.js';

const categorySchema = new mongoose.Schema(
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.pre('validate', function buildSlug(next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = toSlug(this.name);
  }

  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
