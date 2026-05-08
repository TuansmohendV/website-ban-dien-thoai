import SearchHistory from '../models/SearchHistory.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// Get search history
export const getSearchHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const userId = req.user._id;
  const skip = (page - 1) * limit;

  const history = await SearchHistory.find({ userId })
    .limit(limit * 1)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await SearchHistory.countDocuments({ userId });

  res.json({
    status: 'success',
    data: history,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

// Delete search history item
export const deleteSearchHistoryItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const item = await SearchHistory.findOneAndDelete({ _id: id, userId });

  if (!item) {
    return next(new AppError('Không tìm thấy item lịch sử tìm kiếm', 404));
  }

  res.json({
    status: 'success',
    message: 'Xóa lịch sử tìm kiếm thành công',
  });
});

// Clear all search history
export const clearSearchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await SearchHistory.deleteMany({ userId });

  res.json({
    status: 'success',
    message: 'Xóa toàn bộ lịch sử tìm kiếm thành công',
  });
});

// Save search (internal function, call from product search)
export const saveSearchHistory = asyncHandler(async (userId, keyword, resultCount = 0) => {
  // Check if keyword already exists, if yes update, if no create new
  const existingSearch = await SearchHistory.findOne({ userId, keyword });

  if (existingSearch) {
    existingSearch.resultCount = resultCount;
    await existingSearch.save();
  } else {
    await SearchHistory.create({ userId, keyword, resultCount });
  }
});
