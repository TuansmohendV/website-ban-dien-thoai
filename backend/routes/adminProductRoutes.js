import express from 'express';
import {
  createAdminProduct,
  getAdminProducts,
  getAdminProductDetail,
  updateAdminProduct,
  deleteAdminProduct,
} from '../controllers/productController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, requireAdmin);
router.get('/', getAdminProducts);
router.post('/', createAdminProduct);
router.get('/:id', getAdminProductDetail);
router.put('/:id', updateAdminProduct);
router.delete('/:id', deleteAdminProduct);

export default router;
