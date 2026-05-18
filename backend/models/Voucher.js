import mongoose from 'mongoose';

const voucherUsageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageLimitPerUser: {
      type: Number,
      default: 1,
      min: 0,
    },
    usageByUser: {
      type: [voucherUsageSchema],
      default: [],
    },
    startsAt: Date,
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    isHuntedOnly: {
      type: Boolean,
      default: false,
    },
    missionTask: {
      type: String,
      default: '', // Description of the task/mission
    },
    huntLimit: {
      type: Number,
      default: 0, // 0 = unlimited, >0 = limited quantity
      min: 0,
    },
    huntedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

voucherSchema.pre('validate', function normalizeCode() {
  if (this.code) {
    this.code = this.code.toUpperCase().trim();
  }
});

const Voucher = mongoose.model('Voucher', voucherSchema);

export default Voucher;
