import express from 'express';
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
} from '../controllers/bookController.js';
import Book from '../models/bookModel.js';
import { paginateMiddleware, validateStringField, checkDocumentExists, checkAuthorExists, sanitizeCreateBody } from '../middlewares/common.js';

const router = express.Router();

router.get('/', paginateMiddleware, getBooks);
router.get('/:id', checkDocumentExists(Book, 'author'), getBook);
router.post('/', sanitizeCreateBody, validateStringField('title'), checkAuthorExists, createBook);
router.put('/:id', checkDocumentExists(Book), validateStringField('title'), checkAuthorExists, updateBook);
router.delete('/:id', checkDocumentExists(Book), deleteBook);

export default router;
