import Book from '../models/bookModel.js';
import Author from '../models/authorModel.js';

// GET /books
export const getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    
    const validPage = (page && page > 0) ? page : 1;
    const validLimit = (limit && limit > 0) ? limit : 10;
    const startIndex = (validPage - 1) * validLimit;

    const query = {};

    if (req.query.genre) {
      query.genre = { $regex: new RegExp('^' + req.query.genre + '$', 'i') };
    }

    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query).skip(startIndex).limit(validLimit);

    res.status(200).json({ 
      success: true, 
      count: books.length,
      pagination: {
        total,
        page: validPage,
        pages: Math.ceil(total / validLimit)
      },
      data: books 
    });
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

    const book = await Book.findById(req.params.id).populate('author');
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
    if (req.body.author) {
      if (!req.body.author.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ success: false, message: 'Invalid Author ID format' });
      }
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

    if (req.body.author) {
      if (!req.body.author.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ success: false, message: 'Invalid Author ID format' });
      }
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
