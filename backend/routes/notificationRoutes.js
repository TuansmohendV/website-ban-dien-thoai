import express from 'express';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  markNotificationsReadByType,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getNotifications);
router.get('/count', getUnreadNotificationCount);
router.get('/unread-count', getUnreadNotificationCount);
router.patch('/read-by-type', markNotificationsReadByType);
router.patch('/:id/read', markNotificationAsRead);
router.patch('/mark-all-read', markAllNotificationsAsRead);
router.patch('/read-all', markAllNotificationsAsRead);

export default router;
