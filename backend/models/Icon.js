import mongoose from 'mongoose';

const iconSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên icon'],
      unique: true,
    },
    url: {
      type: String,
      required: [true, 'Vui lòng nhập URL icon'],
    },
    category: {
      type: String,
      default: 'general',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Icon', iconSchema);
