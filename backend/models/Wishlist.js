import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

wishlistSchema.index(
  { userId: 1, productId: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: { $ne: true } },
  }
);

export default mongoose.model('Wishlist', wishlistSchema);
