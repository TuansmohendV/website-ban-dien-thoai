import mongoose from 'mongoose';

const voucherBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      required: true,
    },
    linkUrl: {
      type: String,
      default: '/hunt-vouchers',
    },
    badgeText: {
      type: String,
      default: '',
    },
    bgColor: {
      type: String,
      default: '#1e293b', // dark slate default
    },
    textColor: {
      type: String,
      default: '#ffffff',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const VoucherBanner = mongoose.model('VoucherBanner', voucherBannerSchema);
export default VoucherBanner;
