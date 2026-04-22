import express from 'express';
import {
  compareProductSpecs,
  getProductById,
  getProductSpecs,
  getProducts,
  getProductSuggestions,
} from '../controllers/productController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getProducts);
router.get('/suggest', optionalAuth, getProductSuggestions);
router.get('/specs/compare', compareProductSpecs);
router.get('/:id/specs', getProductSpecs);
router.get('/:id', optionalAuth, getProductById);

export default router;
