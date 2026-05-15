import express from 'express';
import {
  getTradeInBrands,
  getTradeInModels,
  calculateValuation,
  addTradeInDevice,
} from '../controllers/tradeInController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/brands', getTradeInBrands);
router.get('/models/:brand', getTradeInModels);
router.post('/calculate', calculateValuation);

// Admin
router.post('/admin/devices', protect, requireAdmin, addTradeInDevice);

export default router;
