import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let ioInstance = null;

export const initRealtime = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('AUTH_REQUIRED'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'development-secret-key'
      );
      const user = await User.findById(decoded.userId).select(
        '-password -resetPasswordToken -resetPasswordExpiresAt'
      );

      if (!user || !user.isActive) {
        return next(new Error('AUTH_INVALID'));
      }

      socket.user = user;
      next();
    } catch {
      next(new Error('AUTH_INVALID'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`);

    if (socket.user.role === 'admin' || socket.user.isAdmin === true) {
      socket.join('admin:support');
    }
  });

  ioInstance = io;
  return io;
};

export const emitSupportTicketUpdated = (ticket) => {
  if (!ioInstance || !ticket) return;

  const payload = {
    ticket,
  };
  const userId = ticket.userId?._id || ticket.userId;

  if (userId) {
    ioInstance.to(`user:${userId}`).emit('support:ticket-updated', payload);
  }

  ioInstance.to('admin:support').emit('support:ticket-updated', payload);
};
