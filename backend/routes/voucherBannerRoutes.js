import express from 'express';
import {
  getPublicVoucherBanners,
  getAdminVoucherBanners,
  createVoucherBanner,
  updateVoucherBanner,
  deleteVoucherBanner,
} from '../controllers/voucherBannerController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getPublicVoucherBanners);

// Admin
router.get('/admin', protect, requireAdmin, getAdminVoucherBanners);
router.post('/admin', protect, requireAdmin, createVoucherBanner);
router.put('/admin/:id', protect, requireAdmin, updateVoucherBanner);
router.delete('/admin/:id', protect, requireAdmin, deleteVoucherBanner);

export default router;
