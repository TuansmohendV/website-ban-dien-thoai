import express from 'express';
import { momoIpnCallback, paymentCallback, processPayment } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, processPayment);
router.post('/callback', protect, paymentCallback);
router.post('/momo/ipn', momoIpnCallback);

export default router;
