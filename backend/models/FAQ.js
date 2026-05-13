import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Vui lòng nhập câu hỏi'],
    },
    answer: {
      type: String,
      required: [true, 'Vui lòng nhập câu trả lời'],
    },
    category: {
      type: String,
      enum: ['shipping', 'payment', 'product', 'account', 'other'],
      default: 'other',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('FAQ', faqSchema);
