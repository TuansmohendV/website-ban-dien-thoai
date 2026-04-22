import jwt from 'jsonwebtoken';

export const signToken = (userId, tokenVersion = 0) => {
  return jwt.sign(
    { userId, tokenVersion },
    process.env.JWT_SECRET || 'development-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};
