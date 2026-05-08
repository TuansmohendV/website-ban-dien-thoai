import express from 'express';
import {
  getAdminReviews,
  updateAdminReview,
  deleteAdminReview,
} from '../controllers/reviewController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireAdmin);
router.get('/', getAdminReviews);
router.patch('/:id', updateAdminReview);
router.delete('/:id', deleteAdminReview);

export default router;
