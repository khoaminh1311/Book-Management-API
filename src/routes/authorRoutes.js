import express from 'express';
import {
  getAuthors,
  getAuthor,
  createAuthor,
  updateAuthor,
  deleteAuthor
} from '../controllers/authorController.js';

const router = express.Router();

router.get('/', getAuthors);
router.get('/:id', getAuthor);
router.post('/', createAuthor);
router.put('/:id', updateAuthor);
router.delete('/:id', deleteAuthor);

export default router;
