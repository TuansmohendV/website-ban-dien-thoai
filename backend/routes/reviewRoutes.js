import express from 'express';
import {
  createReview,
  getReviewsByProductId,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/:productId', getReviewsByProductId);

export default router;
