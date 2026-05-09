import express from 'express';
import { paymentCallback, processPayment } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, processPayment);
router.post('/callback', protect, paymentCallback);

export default router;
