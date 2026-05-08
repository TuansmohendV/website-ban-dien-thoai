import express from 'express';
import {
  getAdminOrders,
  getAdminOrderDetail,
  updateAdminOrder,
  updateAdminOrderStatus,
} from '../controllers/orderController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireAdmin);
router.get('/', getAdminOrders);
router.get('/:id', getAdminOrderDetail);
router.patch('/:id', updateAdminOrder);
router.put('/:id/status', updateAdminOrderStatus);

export default router;
