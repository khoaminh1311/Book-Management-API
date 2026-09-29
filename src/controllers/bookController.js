import Book from '../models/bookModel.js';
import Author from '../models/authorModel.js';

// GET /books
export const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({ success: true, count: books.length, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// GET /books/:id
export const getBook = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid Book ID format' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// POST /books
export const createBook = async (req, res) => {
  try {
    if (req.body.author && req.body.author.match(/^[0-9a-fA-F]{24}$/)) {
      const authorExists = await Author.findById(req.body.author);
      if (!authorExists) {
        return res.status(404).json({ success: false, message: 'Author not found' });
      }
    }

    const book = await Book.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// PUT /books/:id
export const updateBook = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid Book ID format' });
    }

    if (req.body.author && req.body.author.match(/^[0-9a-fA-F]{24}$/)) {
      const authorExists = await Author.findById(req.body.author);
      if (!authorExists) {
        return res.status(404).json({ success: false, message: 'Author not found' });
      }
    }

    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// DELETE /books/:id
export const deleteBook = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid Book ID format' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
