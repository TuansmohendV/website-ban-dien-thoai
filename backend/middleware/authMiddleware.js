import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
};

const loadUserFromToken = async (req, strict = true) => {
  const token = getBearerToken(req);

  if (!token) {
    if (strict) {
      throw new AppError(401, 'Bạn cần đăng nhập để thực hiện chức năng này.');
    }

    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'development-secret-key'
    );

    const user = await User.findById(decoded.userId).select(
      '-password -resetPasswordToken -resetPasswordExpiresAt'
    );

    if (!user || !user.isActive) {
      if (strict) {
        throw new AppError(401, 'Phiên đăng nhập không còn hợp lệ.');
      }

      return null;
    }

    return user;
  } catch (error) {
    if (strict) {
      throw new AppError(401, 'Token không hợp lệ hoặc đã hết hạn.');
    }

    return null;
  }
};

export const protect = asyncHandler(async (req, res, next) => {
  req.user = await loadUserFromToken(req, true);
  next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  req.user = await loadUserFromToken(req, false);
  next();
});
