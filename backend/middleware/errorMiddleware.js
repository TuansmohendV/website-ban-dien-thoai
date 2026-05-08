import mongoose from 'mongoose';

export const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy endpoint ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode;

  if (!statusCode || statusCode < 400) {
    statusCode = 500;
  }

  let message = err.message || 'Có lỗi xảy ra ở máy chủ.';
  let details = err.details || null;

  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyPattern || {})[0];
    message = `Dữ liệu ${duplicatedField || 'này'} đã tồn tại.`;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Dữ liệu gửi lên chưa hợp lệ.';
    details = Object.values(err.errors).map((item) => item.message);
  }

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'ID hoặc tham số truy vấn không hợp lệ.';
  }

  res.status(statusCode).json({
    message,
    details,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
