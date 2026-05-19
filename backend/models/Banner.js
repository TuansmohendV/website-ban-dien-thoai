import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    type: { type: String, default: 'Main Carousel' },
    targetPage: { type: String, default: 'Trang chủ' },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, default: '' },
    status: { type: String, default: 'active' },
    position: { type: Number, default: 1 },
    
    // Extra fields for Voucher Banner or custom styling
    subtitle: { type: String, default: '' },
    badgeText: { type: String, default: '' },
    bgColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#1e293b' }, // Title color
    titleAlign: { type: String, default: 'left' }, // left, center, right
    titleIsBold: { type: Boolean, default: true },
    titleIsItalic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Banner', bannerSchema);
