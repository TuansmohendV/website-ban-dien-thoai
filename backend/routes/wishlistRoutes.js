import express from 'express';
import {
  addWishlistItem,
  getWishlist,
  getWishlistCount,
  removeWishlistItem,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', addWishlistItem);
router.get('/', getWishlist);
router.get('/count', getWishlistCount);
router.delete('/:id', removeWishlistItem);

export default router;
