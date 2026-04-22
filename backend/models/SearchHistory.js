import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    keyword: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedKeyword: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    totalSearches: {
      type: Number,
      default: 1,
      min: 1,
    },
    lastResultCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSearchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

searchHistorySchema.index({ user: 1, normalizedKeyword: 1 }, { unique: true });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
