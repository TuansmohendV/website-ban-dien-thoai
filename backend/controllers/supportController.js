import FAQ from '../models/FAQ.js';
import SupportTicket from '../models/SupportTicket.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { buildRegex, getPagination, parseBoolean } from '../utils/admin.js';
import { createUserNotification } from '../utils/notification.js';

const buildFaqPayload = (body = {}) => {
  const payload = {};

  if (typeof body.question !== 'undefined') {
    payload.question = String(body.question || '').trim();
  }

  if (typeof body.answer !== 'undefined') {
    payload.answer = String(body.answer || '').trim();
  }

  if (typeof body.category !== 'undefined') {
    payload.category = String(body.category || '').trim() || 'general';
  }

  if (typeof body.order !== 'undefined') {
    payload.order = Number(body.order) || 0;
  }

  const nextIsActive = parseBoolean(body.isActive);

  if (typeof nextIsActive !== 'undefined') {
    payload.isActive = nextIsActive;
  }

  return payload;
};

const buildTicketResponse = (ticket) => ({
  ...ticket,
  hasResponse: Boolean(ticket.adminResponse),
});

export const getFaqs = asyncHandler(async (req, res) => {
  const keyword = String(req.query.keyword || req.query.search || '').trim();
  const query = { isActive: true };

  if (keyword) {
    const keywordRegex = buildRegex(keyword);
    query.$or = [
      { question: keywordRegex },
      { answer: keywordRegex },
      { category: keywordRegex },
    ];
  }

  const data = await FAQ.find(query)
    .sort({ order: 1, createdAt: -1 })
    .lean();

  res.json({
    data,
  });
});

export const createSupportTicket = asyncHandler(async (req, res) => {
  const { subject, message, attachments = [] } = req.body;

  if (!subject || !message) {
    throw new AppError(400, 'Vui lòng nhập chủ đề và nội dung yêu cầu hỗ trợ.');
  }

  const ticket = await SupportTicket.create({
    user: req.user._id,
    subject: String(subject).trim(),
    message: String(message).trim(),
    contactEmail: req.body.contactEmail || req.user.email || '',
    contactPhone: req.body.contactPhone || req.user.phone || '',
    attachments: Array.isArray(attachments) ? attachments : [],
  });

  res.status(201).json({
    message: 'Đã gửi yêu cầu hỗ trợ thành công.',
    ticket,
  });
});

export const getUserSupportTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    data: tickets.map(buildTicketResponse),
  });
});

export const getUserSupportTicketById = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).lean();

  if (!ticket) {
    throw new AppError(404, 'Không tìm thấy yêu cầu hỗ trợ.');
  }

  res.json({
    ticket: buildTicketResponse(ticket),
  });
});

export const getAdminFaqs = asyncHandler(async (req, res) => {
  const keyword = String(req.query.keyword || req.query.search || '').trim();
  const isActive = parseBoolean(req.query.isActive);
  const query = {};

  if (keyword) {
    const keywordRegex = buildRegex(keyword);
    query.$or = [
      { question: keywordRegex },
      { answer: keywordRegex },
      { category: keywordRegex },
    ];
  }

  if (typeof isActive !== 'undefined') {
    query.isActive = isActive;
  }

  const data = await FAQ.find(query)
    .sort({ order: 1, createdAt: -1 })
    .lean();

  res.json({
    data,
  });
});

export const createAdminFaq = asyncHandler(async (req, res) => {
  const payload = buildFaqPayload(req.body);

  if (!payload.question || !payload.answer) {
    throw new AppError(400, 'Câu hỏi và câu trả lời FAQ là bắt buộc.');
  }

  const faq = await FAQ.create(payload);

  res.status(201).json({
    message: 'Tạo FAQ thành công.',
    faq,
  });
});

export const updateAdminFaq = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    throw new AppError(404, 'Không tìm thấy FAQ.');
  }

  Object.assign(faq, buildFaqPayload(req.body));

  if (!String(faq.question || '').trim() || !String(faq.answer || '').trim()) {
    throw new AppError(400, 'Câu hỏi và câu trả lời FAQ là bắt buộc.');
  }

  await faq.save();

  res.json({
    message: 'Cập nhật FAQ thành công.',
    faq,
  });
});

export const deleteAdminFaq = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    throw new AppError(404, 'Không tìm thấy FAQ.');
  }

  await faq.deleteOne();

  res.json({
    message: 'Đã xóa FAQ thành công.',
  });
});

export const getAdminSupportTickets = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, 10, 100);
  const keyword = String(req.query.keyword || req.query.search || '').trim();
  const query = {};

  if (req.query.status) {
    query.status = String(req.query.status).trim();
  }

  if (keyword) {
    const keywordRegex = buildRegex(keyword);
    query.$or = [
      { subject: keywordRegex },
      { message: keywordRegex },
      { contactEmail: keywordRegex },
      { contactPhone: keywordRegex },
    ];
  }

  const [total, data] = await Promise.all([
    SupportTicket.countDocuments(query),
    SupportTicket.find(query)
      .populate('user', 'fullName email phone avatar isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  res.json({
    data: data.map(buildTicketResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const getAdminSupportTicketById = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id)
    .populate('user', 'fullName email phone avatar isActive')
    .lean();

  if (!ticket) {
    throw new AppError(404, 'Không tìm thấy yêu cầu hỗ trợ.');
  }

  res.json({
    ticket: buildTicketResponse(ticket),
  });
});

export const updateAdminSupportTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);
  const hasAdminResponse = typeof req.body.adminResponse !== 'undefined';

  if (!ticket) {
    throw new AppError(404, 'Không tìm thấy yêu cầu hỗ trợ.');
  }

  if (typeof req.body.status !== 'undefined') {
    ticket.status = String(req.body.status).trim();
  }

  if (hasAdminResponse) {
    ticket.adminResponse = String(req.body.adminResponse || '').trim();
    ticket.respondedAt = ticket.adminResponse ? new Date() : ticket.respondedAt;
  }

  if (typeof req.body.adminNotes !== 'undefined') {
    ticket.adminNotes = String(req.body.adminNotes || '').trim();
  }

  await ticket.save();

  if (hasAdminResponse && ticket.adminResponse) {
    await createUserNotification({
      userId: ticket.user,
      type: 'support',
      title: 'Yêu cầu hỗ trợ đã được phản hồi',
      message: `Yêu cầu "${ticket.subject}" đã có phản hồi từ quản trị viên.`,
      data: {
        supportTicketId: ticket._id,
        status: ticket.status,
      },
    });
  }

  res.json({
    message: 'Cập nhật yêu cầu hỗ trợ thành công.',
    ticket,
  });
});
