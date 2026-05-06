import express from 'express';
import {
  createReview,
  deleteAdminReview,
  getAdminReviews,
  getReviewsByProductId,
  updateAdminReview,
} from '../controllers/reviewController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/', protect, createReview);

// Admin routes
router.get('/admin/list', protect, requireAdmin, getAdminReviews);
router.patch('/admin/:id', protect, requireAdmin, updateAdminReview);
router.delete('/admin/:id', protect, requireAdmin, deleteAdminReview);

// Public
router.get('/:productId', getReviewsByProductId);

export default router;
