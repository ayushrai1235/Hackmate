import express from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/uploadController.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

// Set up multer with memory storage and limit size to 5MB
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Protected upload route
router.post('/', isAuth, upload.single('file'), uploadFile);

export default router;
