import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Note: Integrate multer middleware here for file upload
// import multer from 'multer';
// const upload = multer({ dest: 'uploads/' });
// router.post('/', protect, upload.single('file'), uploadImage);

router.post('/', protect, uploadImage);
router.post('/image', protect, uploadImage);

export default router;
