import express from 'express';
import {
  createSupportTicket,
  getFaqs,
  getUserSupportTicketById,
  getUserSupportTickets,
} from '../controllers/supportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/faqs', getFaqs);
router.post('/tickets', protect, createSupportTicket);
router.get('/tickets', protect, getUserSupportTickets);
router.get('/tickets/:id', protect, getUserSupportTicketById);

export default router;
