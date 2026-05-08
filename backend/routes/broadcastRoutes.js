import express from 'express';
import {
  createAdminBroadcast,
  getAdminBroadcasts,
  deleteAdminBroadcast,
  sendBroadcast,
} from '../controllers/broadcastController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireAdmin);
router.post('/', createAdminBroadcast);
router.get('/', getAdminBroadcasts);
router.delete('/:id', deleteAdminBroadcast);
router.post('/:id/send', sendBroadcast);

export default router;
