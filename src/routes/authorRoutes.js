import express from 'express';
import {
  getAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor
} from '../controllers/authorController.js';
import Author from '../models/authorModel.js';
import { paginateMiddleware, validateStringField, checkDocumentExists, sanitizeCreateBody } from '../middlewares/common.js';

const router = express.Router();

router.get('/', paginateMiddleware, getAuthors);
router.get('/:id', checkDocumentExists(Author), getAuthor);
router.post('/', sanitizeCreateBody, validateStringField('name'), createAuthor);
router.put('/:id', validateStringField('name'), updateAuthor);
router.delete('/:id', deleteAuthor);

export default router;
