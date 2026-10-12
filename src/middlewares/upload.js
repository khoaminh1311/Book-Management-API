import multer from 'multer';
import { AppError } from '../utils/errors.js';

// Use in-memory storage buffer (does not write temporary files to ephemeral disk)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WEBP image files are allowed', 400), false);
  }
};

export const uploadCoverMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit matching Figma specification
  },
  fileFilter,
}).single('cover');
