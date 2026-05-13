import express from 'express';
import {
  createAdminBrand,
  getAdminBrands,
  getAdminBrandDetail,
  updateAdminBrand,
  deleteAdminBrand,
  getBrands,
  getBrandDetail,
} from '../controllers/brandController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (support both /api/brands and /api/brands/public)
router.get('/public', getBrands);
router.get('/public/:id', getBrandDetail);

// Admin routes
router.post('/', protect, requireAdmin, createAdminBrand);
router.get('/', protect, requireAdmin, getAdminBrands);
router.get('/:id', protect, requireAdmin, getAdminBrandDetail);
router.put('/:id', protect, requireAdmin, updateAdminBrand);
router.delete('/:id', protect, requireAdmin, deleteAdminBrand);

export default router;
