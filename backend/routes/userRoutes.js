import express from 'express';
import {
  addWishlistItem,
  clearSearchHistory,
  deleteSearchHistoryItem,
  getSearchHistory,
  getUserProfile,
  getUserStats,
  getWishlist,
  getWishlistCount,
  removeWishlistItem,
  updateUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/stats', protect, getUserStats);
router.get('/wishlist', protect, getWishlist);
router.get('/wishlist/count', protect, getWishlistCount);
router.post('/wishlist', protect, addWishlistItem);
router.delete('/wishlist/:productId', protect, removeWishlistItem);
router.get('/search-history', protect, getSearchHistory);
router.delete('/search-history', protect, clearSearchHistory);
router.delete('/search-history/:id', protect, deleteSearchHistoryItem);

export default router;
