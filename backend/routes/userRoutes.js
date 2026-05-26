import express from 'express';
import {
  createAdminCustomer,
  createAdminUser,
  deleteAdminUser,
  getAdminUserDetail,
  getAdminUsers,
  getUserProfile,
  getUserStats,
  linkAccount,
  lookupBankAccount,
  updateAdminUser,
  updateAdminUserPassword,
  updateAdminUserRole,
  updateUserProfile,
} from '../controllers/userController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/link-account', protect, linkAccount);
router.post('/lookup-bank-account', protect, lookupBankAccount);
router.get('/stats', protect, getUserStats);

// Admin routes (mounted at /api/user/admin/* AND /api/admin/users via server.js)
router.get('/admin', protect, requireAdmin, getAdminUsers);
router.post('/admin/customers', protect, requireAdmin, createAdminCustomer);
router.post('/admin', protect, requireAdmin, createAdminUser);
router.get('/admin/:id', protect, requireAdmin, getAdminUserDetail);
router.put('/admin/:id', protect, requireAdmin, updateAdminUser);
router.patch('/admin/:id', protect, requireAdmin, updateAdminUser);
router.patch('/admin/:id/role', protect, requireAdmin, updateAdminUserRole);
router.put('/admin/:id/password', protect, requireAdmin, updateAdminUserPassword);
router.delete('/admin/:id', protect, requireAdmin, deleteAdminUser);

// Also support direct routes when mounted at /api/admin/users
router.get('/', protect, requireAdmin, getAdminUsers);
router.post('/', protect, requireAdmin, createAdminUser);
router.get('/:id', protect, requireAdmin, getAdminUserDetail);
router.patch('/:id', protect, requireAdmin, updateAdminUser);
router.put('/:id', protect, requireAdmin, updateAdminUser);
router.patch('/:id/role', protect, requireAdmin, updateAdminUserRole);
router.delete('/:id', protect, requireAdmin, deleteAdminUser);

export default router;
