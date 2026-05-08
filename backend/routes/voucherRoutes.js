import express from 'express';
import {
  applyVoucher,
  createAdminVoucher,
  deleteAdminVoucher,
  getAdminVoucherDetail,
  getAdminVouchers,
  updateAdminVoucher,
} from '../controllers/voucherController.js';
import { optionalAuth, protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes (when mounted at /api/voucher)
router.get('/admin', protect, requireAdmin, getAdminVouchers);
router.post('/admin', protect, requireAdmin, createAdminVoucher);
router.get('/admin/:id', protect, requireAdmin, getAdminVoucherDetail);
router.put('/admin/:id', protect, requireAdmin, updateAdminVoucher);
router.patch('/admin/:id', protect, requireAdmin, updateAdminVoucher);
router.delete('/admin/:id', protect, requireAdmin, deleteAdminVoucher);

// Public
router.post('/apply', optionalAuth, applyVoucher);

export default router;
