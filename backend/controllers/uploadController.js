import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// Upload image (placeholder - integrate with Cloudinary)
export const uploadImage = asyncHandler(async (req, res, next) => {
  const { target } = req.query;
  const userId = req.user._id;

  // Check if file exists
  if (!req.file) {
    return next(new AppError('Vui lòng cung cấp file ảnh', 400));
  }

  // In a real implementation, upload to Cloudinary
  // For now, return a mock URL
  const mockImageUrl = `https://example.com/uploads/${userId}/${Date.now()}.jpg`;

  // If target is avatar, update user avatar
  if (target === 'avatar') {
    // Update user model here
    // User.findByIdAndUpdate(userId, { avatar: mockImageUrl })
  }

  res.status(201).json({
    status: 'success',
    message: 'Tải ảnh lên thành công',
    data: {
      url: mockImageUrl,
      target,
    },
  });
});
