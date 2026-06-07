import express from 'express';
import {
  applyVoucher,
  createAdminVoucher,
  deleteAdminVoucher,
  getAdminVoucherDetail,
  getAdminVouchers,
  getPublicVouchers,
  getHuntedVouchers,
  huntVoucher,
  getUserVouchers,
  getPendingProofs,
  reviewProof,
  updateAdminVoucher,
} from '../controllers/voucherController.js';
import { optionalAuth, protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getPublicVouchers);
router.get('/hunted-list', optionalAuth, getHuntedVouchers);

// User routes
router.post('/apply', optionalAuth, applyVoucher);
router.post('/hunt', protect, huntVoucher);
router.get('/my-vouchers', protect, getUserVouchers);

// Admin routes (when mounted at /api/voucher)
router.get('/admin', protect, requireAdmin, getAdminVouchers);
router.get('/admin/pending-proofs', protect, requireAdmin, getPendingProofs);
router.post('/admin/review-proof/:id', protect, requireAdmin, reviewProof);
router.post('/admin', protect, requireAdmin, createAdminVoucher);
router.get('/admin/:id', protect, requireAdmin, getAdminVoucherDetail);
router.put('/admin/:id', protect, requireAdmin, updateAdminVoucher);
router.patch('/admin/:id', protect, requireAdmin, updateAdminVoucher);
router.delete('/admin/:id', protect, requireAdmin, deleteAdminVoucher);

export default router;
