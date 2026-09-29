import express from 'express';

const router = express.Router();

// GET all books
router.get('/', (req, res) => {
  res.status(200).json({ message: 'GET all books (temporary)' });
});

// GET single book
router.get('/:id', (req, res) => {
  res.status(200).json({ message: `GET book ${req.params.id} (temporary)` });
});

// POST create book
router.post('/', (req, res) => {
  res.status(201).json({ message: 'POST create book (temporary)' });
});

// PUT update book
router.put('/:id', (req, res) => {
  res.status(200).json({ message: `PUT update book ${req.params.id} (temporary)` });
});

// DELETE book
router.delete('/:id', (req, res) => {
  res.status(200).json({ message: `DELETE book ${req.params.id} (temporary)` });
});

export default router;
