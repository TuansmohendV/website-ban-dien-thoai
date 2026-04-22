import express from 'express';
import { getBrandById, getBrands } from '../controllers/brandController.js';

const router = express.Router();

router.get('/', getBrands);
router.get('/:id', getBrandById);

export default router;
