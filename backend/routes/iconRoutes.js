import express from 'express';
import {
  createAdminIcon,
  getAdminIcons,
  deleteAdminIcon,
  getIcons,
} from '../controllers/iconController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/public', getIcons);

// Admin routes
router.post('/', protect, requireAdmin, createAdminIcon);
router.get('/', protect, requireAdmin, getAdminIcons);
router.delete('/:id', protect, requireAdmin, deleteAdminIcon);

export default router;
