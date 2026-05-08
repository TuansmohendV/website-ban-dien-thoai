import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
    method: {
      type: String,
      enum: ['COD', 'VNPAY', 'MOMO', 'CARD', 'BANK_TRANSFER'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    providerTransactionId: {
      type: String,
      default: '',
    },
    providerResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    paidAt: Date,
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
