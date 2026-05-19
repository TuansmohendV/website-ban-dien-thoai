import mongoose from 'mongoose';

const userVoucherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voucher',
      required: true,
    },
    huntedAt: {
      type: Date,
      default: Date.now,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    proofImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate hunting
userVoucherSchema.index({ user: 1, voucher: 1 }, { unique: true });

const UserVoucher = mongoose.model('UserVoucher', userVoucherSchema);

export default UserVoucher;
