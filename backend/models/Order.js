import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    selectedColor: {
      type: String,
      default: '',
    },
    selectedStorage: {
      type: String,
      default: '',
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
      index: true,
    },
    guestId: {
      type: String,
      trim: true,
      default: undefined,
      index: true,
    },
    customerInfo: {
      fullName: { type: String, required: true },
      email: { type: String, default: '' },
      phone: { type: String, required: true },
    },
    invoiceInfo: {
      enabled: { type: Boolean, default: false },
      email: { type: String, default: '' },
      companyName: { type: String, default: '' },
      taxCode: { type: String, default: '' },
      companyAddress: { type: String, default: '' },
    },
    shippingAddress: {
      label: { type: String, default: '' },
      recipientName: { type: String, required: true },
      phone: { type: String, required: true },
      province: { type: String, required: true },
      district: { type: String, required: true },
      ward: { type: String, required: true },
      street: { type: String, required: true },
      note: { type: String, default: '' },
    },
    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    voucherCode: {
      type: String,
      default: '',
    },
    voucherSnapshot: {
      code: String,
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
      discountValue: Number,
      maxDiscount: Number,
      minOrderValue: Number,
      discountAmount: Number,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'VNPAY', 'MOMO', 'CARD', 'BANK_TRANSFER'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paidAt: Date,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'packing', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },
    timeline: {
      type: [timelineSchema],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    cancelReason: {
      type: String,
      default: '',
    },
    placedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
