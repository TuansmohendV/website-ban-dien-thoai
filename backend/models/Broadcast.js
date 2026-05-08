import mongoose from 'mongoose';

const broadcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề'],
    },
    message: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung thông báo'],
    },
    targetAudience: {
      type: String,
      enum: ['all', 'new_users', 'active_users', 'admin'],
      default: 'all',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    isSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Broadcast', broadcastSchema);
