import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';

const allowedTargetsByRole = {
  admin: new Set(['product', 'avatar', 'review']),
  user: new Set(['avatar', 'review']),
};

const buildFolderFromTarget = (target = 'misc') => {
  const folderMap = {
    product: 'mobile-shop/products',
    avatar: 'mobile-shop/avatars',
    review: 'mobile-shop/reviews',
    misc: 'mobile-shop/misc',
  };

  return folderMap[target] || folderMap.misc;
};

export const uploadImage = asyncHandler(async (req, res) => {
  const { fileData, target = 'misc', publicId, autoAssignAvatar } = req.body;
  const role = req.user.role || 'user';
  const allowedTargets = allowedTargetsByRole[role] || new Set();

  if (!allowedTargets.has(target)) {
    throw new AppError(
      403,
      'Bạn không có quyền upload loại hình ảnh này.'
    );
  }

  const uploadedFile = await uploadImageToCloudinary({
    fileData,
    folder: buildFolderFromTarget(target),
    publicId,
  });

  let updatedUser = null;

  if (target === 'avatar' && autoAssignAvatar !== false) {
    updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: uploadedFile.url },
      { new: true }
    ).select(
      '-password -tokenVersion -googleId -facebookId -resetPasswordToken -resetPasswordExpiresAt'
    );
  }

  res.status(201).json({
    message: 'Upload hình ảnh thành công.',
    file: uploadedFile,
    user: updatedUser || undefined,
  });
});
