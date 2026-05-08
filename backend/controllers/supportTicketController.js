import SupportTicket from '../models/SupportTicket.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

// User: Create support ticket
export const createSupportTicket = asyncHandler(async (req, res, next) => {
  const { title, description, category, orderId } = req.body;
  const userId = req.user._id;

  if (!title || !description) {
    return next(new AppError('Vui lòng nhập tiêu đề và mô tả', 400));
  }

  const ticket = await SupportTicket.create({
    userId,
    title,
    description,
    category,
    orderId: orderId || null,
  });

  res.status(201).json({
    status: 'success',
    message: 'Tạo ticket hỗ trợ thành công',
    data: { ticket },
  });
});

// User: Get support tickets
export const getSupportTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const userId = req.user._id;
  const skip = (page - 1) * limit;

  const query = { userId };
  if (status) query.status = status;

  const tickets = await SupportTicket.find(query)
    .populate('orderId', 'orderCode totalPrice')
    .limit(limit * 1)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await SupportTicket.countDocuments(query);

  res.json({
    status: 'success',
    data: tickets,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

// User: Get support ticket detail
export const getSupportTicketDetail = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const ticket = await SupportTicket.findOne({ _id: req.params.id, userId }).populate(
    'orderId',
    'orderCode totalPrice'
  );

  if (!ticket) {
    return next(new AppError('Không tìm thấy ticket', 404));
  }

  res.json({
    status: 'success',
    data: { ticket },
  });
});

// Admin: List support tickets
export const getAdminSupportTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority, search } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const tickets = await SupportTicket.find(query)
    .populate('userId', 'fullName email phone')
    .populate('orderId', 'orderCode')
    .limit(limit * 1)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await SupportTicket.countDocuments(query);

  res.json({
    status: 'success',
    data: tickets,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

// Admin: Get support ticket detail
export const getAdminSupportTicketDetail = asyncHandler(async (req, res, next) => {
  const ticket = await SupportTicket.findById(req.params.id)
    .populate('userId', 'fullName email phone')
    .populate('orderId', 'orderCode totalPrice');

  if (!ticket) {
    return next(new AppError('Không tìm thấy ticket', 404));
  }

  res.json({
    status: 'success',
    data: { ticket },
  });
});

// Admin: Update support ticket
export const updateAdminSupportTicket = asyncHandler(async (req, res, next) => {
  const { status, priority, adminResponse } = req.body;

  let ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    return next(new AppError('Không tìm thấy ticket', 404));
  }

  if (status) ticket.status = status;
  if (priority) ticket.priority = priority;
  if (adminResponse) {
    ticket.adminResponse = adminResponse;
    ticket.respondedAt = new Date();

    // Create notification for user
    await Notification.create({
      userId: ticket.userId,
      title: 'Phản hồi từ đội hỗ trợ',
      message: adminResponse.substring(0, 100),
      type: 'support',
      relatedId: ticket._id,
      relatedType: 'supportTicket',
    });
  }

  ticket = await ticket.save();

  res.json({
    status: 'success',
    message: 'Cập nhật ticket thành công',
    data: { ticket },
  });
});
