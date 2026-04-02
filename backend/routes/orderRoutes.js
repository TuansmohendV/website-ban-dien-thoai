import express from 'express';
import {
  cancelOrder,
  createOrder,
  getOrderById,
  getUserOrders,
} from '../controllers/orderController.js';
import { optionalAuth, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/user', protect, getUserOrders);
router.put('/cancel/:id', optionalAuth, cancelOrder);
router.get('/:id', optionalAuth, getOrderById);

export default router;
