import express from 'express';
import {
  cancelOrder,
  createOrder,
  getAdminOrderDetail,
  getAdminOrders,
  getOrderById,
  getUserOrders,
  getUserOrderYears,
  updateAdminOrder,
  updateAdminOrderStatus,
  resendInvoiceEmail,
} from '../controllers/orderController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/admin', protect, requireAdmin, getAdminOrders);
router.get('/admin/:id', protect, requireAdmin, getAdminOrderDetail);
router.put('/admin/:id/status', protect, requireAdmin, updateAdminOrderStatus);
router.post('/admin/:id/resend-invoice', protect, requireAdmin, resendInvoiceEmail);
router.patch('/admin/:id', protect, requireAdmin, updateAdminOrder);
router.get('/user', protect, getUserOrders);
router.get('/user/years', protect, getUserOrderYears);
router.put('/cancel/:id', protect, cancelOrder);
router.get('/:id', protect, getOrderById);

export default router;
