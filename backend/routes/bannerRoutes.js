import express from 'express';
import { getPublicBanners, getAdminBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPublicBanners);
router.get('/admin', protect, requireAdmin, getAdminBanners);
router.post('/admin', protect, requireAdmin, createBanner);
router.put('/admin/:id', protect, requireAdmin, updateBanner);
router.delete('/admin/:id', protect, requireAdmin, deleteBanner);

export default router;
