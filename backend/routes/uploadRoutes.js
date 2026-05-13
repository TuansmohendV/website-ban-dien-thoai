import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = 'public/uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.post('/image', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const url = `/uploads/${req.file.filename}`;
  
  res.json({ success: true, url });
});

router.get('/files', protect, (req, res) => {
  try {
    const dir = 'public/uploads';
    if (!fs.existsSync(dir)) {
      return res.json({ success: true, data: [] });
    }
    
    const files = fs.readdirSync(dir);
    const fileData = files.map(file => {
      const stats = fs.statSync(path.join(dir, file));
      const ext = path.extname(file).toLowerCase();
      let type = 'file';
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) type = 'image';
      else if (['.mp4', '.webm', '.ogg'].includes(ext)) type = 'video';
      
      return {
        id: file,
        name: file,
        type,
        size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
        date: stats.mtime.toLocaleDateString('vi-VN'),
        url: `/uploads/${file}`
      };
    }).sort((a, b) => fs.statSync(path.join(dir, b.id)).mtime - fs.statSync(path.join(dir, a.id)).mtime);
    
    res.json({ success: true, data: fileData });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
