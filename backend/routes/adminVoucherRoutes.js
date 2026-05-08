import express from 'express';
import {
  getAdminVoucherDetail,
  getAdminVouchers,
  createAdminVoucher,
  updateAdminVoucher,
  deleteAdminVoucher,
} from '../controllers/voucherController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireAdmin);
router.get('/', getAdminVouchers);
router.post('/', createAdminVoucher);
router.get('/:id', getAdminVoucherDetail);
router.put('/:id', updateAdminVoucher);
router.patch('/:id', updateAdminVoucher);
router.delete('/:id', deleteAdminVoucher);

export default router;
