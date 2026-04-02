import express from 'express';
import { applyVoucher } from '../controllers/voucherController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/apply', optionalAuth, applyVoucher);

export default router;
