import express from 'express';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryDetail,
  updateCategory,
} from '../controllers/categoryController.js';
import { optionalAuth, protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getCategories);
router.get('/:id', getCategoryDetail);
router.post('/', protect, requireAdmin, createCategory);
router.put('/:id', protect, requireAdmin, updateCategory);
router.delete('/:id', protect, requireAdmin, deleteCategory);

export default router;
