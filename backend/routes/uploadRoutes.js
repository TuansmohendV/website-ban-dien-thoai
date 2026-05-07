import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Note: Integrate multer middleware here for file upload
// import multer from 'multer';
// const upload = multer({ dest: 'uploads/' });
// router.post('/', protect, upload.single('file'), uploadImage);

router.post('/', protect, upload.single('file'), uploadImage);
router.post('/image', protect, upload.single('file'), uploadImage);

export default router;
