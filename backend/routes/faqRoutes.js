import express from 'express';
import {
  createAdminFaq,
  getAdminFaqs,
  updateAdminFaq,
  deleteAdminFaq,
  getFaqs,
} from '../controllers/faqController.js';
import { protect, requireAdmin, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/public', getFaqs);

// Admin routes
router.post('/', protect, requireAdmin, createAdminFaq);
router.get('/', protect, requireAdmin, getAdminFaqs);
router.put('/:id', protect, requireAdmin, updateAdminFaq);
router.delete('/:id', protect, requireAdmin, deleteAdminFaq);

export default router;
