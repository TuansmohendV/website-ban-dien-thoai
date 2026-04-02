import express from 'express';
import {
  addToCart,
  getCart,
  getCartCount,
  removeCartItem,
  updateCart,
} from '../controllers/cartController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(optionalAuth);
router.get('/', getCart);
router.post('/', addToCart);
router.put('/', updateCart);
router.delete('/', removeCartItem);
router.get('/count', getCartCount);

export default router;
