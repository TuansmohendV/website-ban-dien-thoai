import express from 'express';
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUserDetail,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserRole,
} from '../controllers/userController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireAdmin);
router.get('/', getAdminUsers);
router.post('/', createAdminUser);
router.get('/:id', getAdminUserDetail);
router.put('/:id', updateAdminUser);
router.patch('/:id', updateAdminUser);
router.patch('/:id/role', updateAdminUserRole);
router.delete('/:id', deleteAdminUser);

export default router;
