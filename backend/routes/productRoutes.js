import express from 'express';
import {
  compareProductSpecs,
  getProductById,
  getProductSpecs,
  getProducts,
  getProductSuggestions,
  createAdminProduct,
  getAdminProducts,
  getAdminProductDetail,
  updateAdminProduct,
  deleteAdminProduct,
} from '../controllers/productController.js';
import { optionalAuth, protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/suggest', getProductSuggestions);
router.get('/specs/compare', compareProductSpecs);
router.get('/:id/specs', getProductSpecs);
router.get('/:id', getProductById);

// Admin routes (when mounted at /api/products)
router.post('/admin', protect, requireAdmin, createAdminProduct);
router.get('/admin/list', protect, requireAdmin, getAdminProducts);
router.get('/admin/:id', protect, requireAdmin, getAdminProductDetail);
router.put('/admin/:id', protect, requireAdmin, updateAdminProduct);
router.delete('/admin/:id', protect, requireAdmin, deleteAdminProduct);

export default router;
