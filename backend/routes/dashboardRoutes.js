import express from 'express';
import { getAdminDashboard } from '../controllers/dashboardController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, requireAdmin, getAdminDashboard);

export default router;
