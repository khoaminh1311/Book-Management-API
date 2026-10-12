import express from 'express';
import { uploadCoverMiddleware } from '../middlewares/upload.js';
import { uploadCoverImage } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/', uploadCoverMiddleware, uploadCoverImage);

export default router;
