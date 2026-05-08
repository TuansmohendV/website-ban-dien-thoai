import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
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
    maxStock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
    guestId: {
      type: String,
      trim: true,
      default: undefined,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    voucherCode: {
      type: String,
      trim: true,
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
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index(
  { user: 1 },
  {
    unique: true,
    partialFilterExpression: { user: { $type: 'objectId' } },
  }
);

cartSchema.index(
  { guestId: 1 },
  {
    unique: true,
    partialFilterExpression: { guestId: { $type: 'string' } },
  }
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
