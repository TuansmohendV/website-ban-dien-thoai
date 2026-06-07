import express from 'express';
import {
  getAdminVoucherDetail,
  getAdminVouchers,
  createAdminVoucher,
  updateAdminVoucher,
  deleteAdminVoucher,
} from '../controllers/voucherController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

import { distributeWeeklyVouchers } from '../jobs/weeklyVoucherJob.js';

const router = express.Router();

router.use(protect, requireAdmin);
router.get('/', getAdminVouchers);
router.post('/', createAdminVoucher);
router.get('/:id', getAdminVoucherDetail);
router.put('/:id', updateAdminVoucher);
router.patch('/:id', updateAdminVoucher);
router.delete('/:id', deleteAdminVoucher);

// Trigger thủ công phát voucher tuần (chỉ Admin)
router.post('/weekly-distribute', async (req, res) => {
  try {
    await distributeWeeklyVouchers();
    res.json({ message: 'Đã phát voucher tuần thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi phát voucher: ' + error.message });
  }
});

export default router;
