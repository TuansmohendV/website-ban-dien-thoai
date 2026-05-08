import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    keyword: {
      type: String,
      required: true,
      trim: true,
    },
    resultCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

searchHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('SearchHistory', searchHistorySchema);
