import express from 'express';
import {
  getSearchHistory,
  deleteSearchHistoryItem,
  clearSearchHistory,
} from '../controllers/searchHistoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getSearchHistory);
router.delete('/:id', deleteSearchHistoryItem);
router.delete('/', clearSearchHistory);

export default router;
