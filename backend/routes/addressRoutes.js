import express from 'express';
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from '../controllers/addressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', createAddress);
router.get('/', getAddresses);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
