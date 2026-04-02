import express from 'express';
import { processPayment } from '../controllers/orderController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, processPayment);

export default router;
