import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, default: 'Main Carousel' },
    targetPage: { type: String, default: 'Trang chủ' },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, default: '' },
    status: { type: String, default: 'active' },
    position: { type: Number, default: 1 },
    
    // Extra fields for Voucher Banner or custom styling
    subtitle: { type: String, default: '' },
    badgeText: { type: String, default: '' },
    bgColor: { type: String, default: '#1e293b' },
    textColor: { type: String, default: '#ffffff' },
  },
  { timestamps: true }
);

export default mongoose.model('Banner', bannerSchema);
