import express from 'express';
import { createVNPayPaymentUrl, paymentCallback, processPayment } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, processPayment);
router.post('/create_payment_url', protect, createVNPayPaymentUrl);
router.post('/momo/ipn', paymentCallback);
router.post('/callback', protect, paymentCallback);

export default router;
