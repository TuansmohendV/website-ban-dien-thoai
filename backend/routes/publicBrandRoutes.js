import express from 'express';
import { getBrands, getBrandDetail } from '../controllers/brandController.js';

const router = express.Router();

// Public brand routes: GET /api/brands, GET /api/brands/:id
router.get('/', getBrands);
router.get('/:id', getBrandDetail);

export default router;
