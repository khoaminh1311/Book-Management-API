import express from 'express';

const router = express.Router();

// GET all authors
router.get('/', (req, res) => {
  res.status(200).json({ message: 'GET all authors (temporary)' });
});

// POST create author
router.post('/', (req, res) => {
  res.status(201).json({ message: 'POST create author (temporary)' });
});

// PUT update author
router.put('/:id', (req, res) => {
  res.status(200).json({ message: `PUT update author ${req.params.id} (temporary)` });
});

// DELETE author
router.delete('/:id', (req, res) => {
  res.status(200).json({ message: `DELETE author ${req.params.id} (temporary)` });
});

export default router;
