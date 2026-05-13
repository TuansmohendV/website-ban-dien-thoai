import FAQ from '../models/FAQ.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// Admin: Create FAQ
export const createAdminFaq = asyncHandler(async (req, res, next) => {
  const { question, answer, category } = req.body;

  if (!question || !answer) {
    return next(new AppError('Vui lòng nhập câu hỏi và câu trả lời', 400));
  }

  const faq = await FAQ.create({ question, answer, category });

  res.status(201).json({
    status: 'success',
    message: 'Tạo FAQ thành công',
    data: { faq },
  });
});

// Admin: Get all FAQs
export const getAdminFaqs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;
  const skip = (page - 1) * limit;

  const includeInactive = String(req.query.includeInactive) === 'true';
  const query = includeInactive ? {} : { isActive: true };
  if (category) query.category = category;

  const faqs = await FAQ.find(query)
    .limit(limit * 1)
    .skip(skip)
    .sort({ displayOrder: 1, createdAt: -1 });

  const total = await FAQ.countDocuments(query);

  res.json({
    status: 'success',
    data: faqs,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

// Admin: Update FAQ
export const updateAdminFaq = asyncHandler(async (req, res, next) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!faq) {
    return next(new AppError('Không tìm thấy FAQ', 404));
  }

  res.json({
    status: 'success',
    message: 'Cập nhật FAQ thành công',
    data: { faq },
  });
});

// Admin: Delete FAQ
export const deleteAdminFaq = asyncHandler(async (req, res, next) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    return next(new AppError('Không tìm thấy FAQ', 404));
  }

  faq.isActive = false;
  await faq.save();

  res.json({
    status: 'success',
    message: 'Chuyển FAQ vào trạng thái đã ẩn (xoá mềm) thành công',
  });
});

// Public: Get all FAQs
export const getFaqs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;
  const skip = (page - 1) * limit;

  const query = { isActive: true };
  if (category) query.category = category;

  const faqs = await FAQ.find(query)
    .limit(limit * 1)
    .skip(skip)
    .sort({ displayOrder: 1 });

  const total = await FAQ.countDocuments(query);

  res.json({
    status: 'success',
    data: faqs,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});
