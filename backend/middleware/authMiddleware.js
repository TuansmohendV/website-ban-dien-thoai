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

const getTokenVersionFromPayload = (decoded = {}) => {
  const parsedVersion = Number(decoded.tokenVersion);

  if (Number.isInteger(parsedVersion) && parsedVersion >= 0) {
    return parsedVersion;
  }

  return 0;
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
      '-password -resetPasswordToken -resetPasswordExpiresAt +tokenVersion'
    );

    if (!user || !user.isActive) {
      if (strict) {
        throw new AppError(401, 'Phiên đăng nhập không còn hợp lệ.');
      }

      return null;
    }

    if ((user.tokenVersion || 0) !== getTokenVersionFromPayload(decoded)) {
      if (strict) {
        throw new AppError(401, 'Phiên đăng nhập đã bị đăng xuất hoặc thay thế.');
      }

      return null;
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

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

export const requireRoles = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AppError(401, 'Bạn cần đăng nhập để thực hiện chức năng này.');
    }

    const currentRole = req.user.role || 'user';

    if (!roles.includes(currentRole)) {
      throw new AppError(403, 'Bạn không có quyền truy cập chức năng này.');
    }

    next();
  });

export const adminOnly = requireRoles('admin');
