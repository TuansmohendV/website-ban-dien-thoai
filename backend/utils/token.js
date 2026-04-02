import jwt from 'jsonwebtoken';

export const signToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'development-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};
