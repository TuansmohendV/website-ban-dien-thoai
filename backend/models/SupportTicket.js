import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề'],
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả'],
    },
    category: {
      type: String,
      enum: ['order', 'product', 'payment', 'delivery', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    adminResponse: {
      type: String,
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SupportTicket', supportTicketSchema);
