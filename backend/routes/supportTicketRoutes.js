import express from 'express';
import {
  createSupportTicket,
  getSupportTickets,
  getSupportTicketDetail,
  getAdminSupportTickets,
  getAdminSupportTicketDetail,
  updateAdminSupportTicket,
} from '../controllers/supportTicketController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/', protect, createSupportTicket);
router.get('/', protect, getSupportTickets);
router.get('/:id', protect, getSupportTicketDetail);

// Admin routes
router.get('/admin/list', protect, requireAdmin, getAdminSupportTickets);
router.get('/admin/:id', protect, requireAdmin, getAdminSupportTicketDetail);
router.patch('/admin/:id', protect, requireAdmin, updateAdminSupportTicket);

export default router;
