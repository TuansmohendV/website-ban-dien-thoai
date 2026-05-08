import express from 'express';
import {
  getAdminSupportTickets,
  getAdminSupportTicketDetail,
  updateAdminSupportTicket,
} from '../controllers/supportTicketController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin support ticket routes: /api/admin/support/tickets/*
router.get('/tickets', protect, requireAdmin, getAdminSupportTickets);
router.get('/tickets/:id', protect, requireAdmin, getAdminSupportTicketDetail);
router.patch('/tickets/:id', protect, requireAdmin, updateAdminSupportTicket);

export default router;
