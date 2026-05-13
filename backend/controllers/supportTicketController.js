import mongoose from 'mongoose';
import SupportTicket from '../models/SupportTicket.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { emitSupportTicketUpdated } from '../utils/realtime.js';

const populateTicket = (ticketId) =>
  SupportTicket.findById(ticketId)
    .populate('userId', 'fullName email phone')
    .populate('orderId', 'orderCode totalPrice');

const byMessageTime = (a, b) =>
  new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();

/**
 * Build a single thread for API/socket clients. When `messages` was empty and the user
 * sends a new chat line, the array can temporarily contain only user rows while
 * `adminResponse` / `description` still hold older content — the old early-return
 * dropped those fields and the widget looked like a "new" chat without admin text.
 */
const getTicketMessages = (ticket = {}) => {
  const raw = Array.isArray(ticket.messages) ? [...ticket.messages] : [];
  const merged = [...raw];

  const desc = String(ticket.description || '').trim();
  if (desc) {
    const hasDesc = merged.some(
      (m) => m.sender === 'user' && String(m.text || '').trim() === desc
    );
    if (!hasDesc) {
      merged.push({
        _id: `legacy-user-${ticket._id}`,
        sender: 'user',
        user: ticket.userId?._id || ticket.userId || null,
        text: ticket.description,
        createdAt: ticket.createdAt,
      });
    }
  }

  const adminResp = String(ticket.adminResponse || '').trim();
  if (adminResp) {
    const hasAdminText = merged.some(
      (m) => m.sender === 'admin' && String(m.text || '').trim() === adminResp
    );
    if (!hasAdminText) {
      merged.push({
        _id: `legacy-admin-${ticket._id}`,
        sender: 'admin',
        user: null,
        text: ticket.adminResponse,
        createdAt: ticket.respondedAt || ticket.updatedAt,
      });
    }
  }

  return merged.sort(byMessageTime);
};

const toObjectWithMessages = (ticket) => {
  const data = typeof ticket.toObject === 'function' ? ticket.toObject() : ticket;
  return {
    ...data,
    messages: getTicketMessages(data),
  };
};

const getLatestChatTicket = (userId) =>
  SupportTicket.findOne({
    userId,
    source: 'chat',
  }).sort({ updatedAt: -1 });

// User: Create support ticket
export const createSupportTicket = asyncHandler(async (req, res, next) => {
  const { title, description, category, orderId } = req.body;
  const userId = req.user._id;

  if (!title || !description) {
    return next(new AppError('Vui lòng nhập tiêu đề và mô tả', 400));
  }

  let ticket = await SupportTicket.create({
    userId,
    title,
    description,
    category,
    orderId: orderId || null,
    source: 'form',
    messages: [
      {
        sender: 'user',
        user: userId,
        text: description,
      },
    ],
  });

  ticket = await populateTicket(ticket._id);
  emitSupportTicketUpdated(toObjectWithMessages(ticket));

  res.status(201).json({
    status: 'success',
    message: 'Tạo ticket hỗ trợ thành công',
    data: { ticket: toObjectWithMessages(ticket) },
  });
});

export const getSupportChat = asyncHandler(async (req, res) => {
  const ticket = await getLatestChatTicket(req.user._id);

  if (!ticket) {
    return res.json({
      status: 'success',
      data: { ticket: null },
    });
  }

  const populatedTicket = await populateTicket(ticket._id);

  res.json({
    status: 'success',
    data: { ticket: toObjectWithMessages(populatedTicket) },
  });
});

export const createSupportChatMessage = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const text = String(req.body.message || '').trim();
  const category = req.body.category || 'other';
  const requestedTicketId = req.body.ticketId;

  if (!text) {
    throw new AppError(400, 'Vui lòng nhập nội dung tin nhắn.');
  }

  let ticket = null;
  if (requestedTicketId && mongoose.Types.ObjectId.isValid(requestedTicketId)) {
    ticket = await SupportTicket.findOne({
      _id: requestedTicketId,
      userId,
      source: 'chat',
    });
  }

  if (!ticket) {
    ticket = await getLatestChatTicket(userId);
  }

  if (!ticket) {
    const title = text.length > 55 ? `${text.slice(0, 55)}...` : text;
    ticket = await SupportTicket.create({
      userId,
      title: `Chat: ${title}`,
      description: text,
      category,
      source: 'chat',
      messages: [
        {
          sender: 'user',
          user: userId,
          text,
        },
      ],
    });
  } else {
    ticket.messages.push({
      sender: 'user',
      user: userId,
      text,
    });
    ticket.description = ticket.description || text;
    ticket.category = category || ticket.category;

    if (['resolved', 'closed'].includes(ticket.status)) {
      ticket.status = 'open';
    }

    await ticket.save();
  }

  const populatedTicket = await populateTicket(ticket._id);
  const ticketPayload = toObjectWithMessages(populatedTicket);
  emitSupportTicketUpdated(ticketPayload);

  res.status(201).json({
    status: 'success',
    message: 'Đã gửi tin nhắn hỗ trợ.',
    data: { ticket: ticketPayload },
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
    data: { ticket: toObjectWithMessages(ticket) },
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
    data: { ticket: toObjectWithMessages(ticket) },
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
    ticket.messages.push({
      sender: 'admin',
      user: req.user._id,
      text: adminResponse,
    });

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

  await ticket.save();
  ticket = await populateTicket(ticket._id);
  const ticketPayload = toObjectWithMessages(ticket);
  emitSupportTicketUpdated(ticketPayload);

  res.json({
    status: 'success',
    message: 'Cập nhật ticket thành công',
    data: { ticket: ticketPayload },
  });
});
