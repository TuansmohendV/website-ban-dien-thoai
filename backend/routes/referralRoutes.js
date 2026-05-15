import express from 'express';
import {
  getReferralStats,
  getReferralHistory,
  applyReferralCode,
} from '../controllers/referralController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/stats', getReferralStats);
router.get('/history', getReferralHistory);
router.post('/apply', applyReferralCode);

export default router;
