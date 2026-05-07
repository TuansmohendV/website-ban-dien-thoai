import express from 'express';
import {
  createSupportTicket,
  getSupportTickets,
  getSupportTicketDetail,
  getAdminSupportTickets,
  getAdminSupportTicketDetail,
  updateAdminSupportTicket,
} from '../controllers/supportTicketController.js';
import { getFaqs } from '../controllers/faqController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public FAQ route: GET /api/support/faqs
router.get('/faqs', getFaqs);

// User support ticket routes: /api/support/tickets/*
router.post('/tickets', protect, createSupportTicket);
router.get('/tickets', protect, getSupportTickets);
router.get('/tickets/:id', protect, getSupportTicketDetail);

export default router;
