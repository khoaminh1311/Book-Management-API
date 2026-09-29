import Book from '../models/bookModel.js';
import Author from '../models/authorModel.js';

// GET /books
export const getBooks = async (req, res, next) => {
  try {
    const pageStr = req.query.page;
    const limitStr = req.query.limit;

    if (pageStr && (isNaN(pageStr) || parseInt(pageStr, 10) < 1)) {
      res.status(400);
      return next(new Error('Page must be a positive integer'));
    }
    if (limitStr && (isNaN(limitStr) || parseInt(limitStr, 10) < 1 || parseInt(limitStr, 10) > 100)) {
      res.status(400);
      return next(new Error('Limit must be a positive integer between 1 and 100'));
    }
    
    const validPage = pageStr ? parseInt(pageStr, 10) : 1;
    const validLimit = limitStr ? parseInt(limitStr, 10) : 10;
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
    next(error);
  }
};

// GET /books/:id
export const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('author');
    if (!book) {
      res.status(404);
      return next(new Error('Book not found'));
    }

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// POST /books
export const createBook = async (req, res, next) => {
  try {
    if (req.body.author) {
      const authorExists = await Author.findById(req.body.author);
      if (!authorExists) {
        res.status(404);
        return next(new Error('Author not found'));
      }
    }

    const book = await Book.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// PUT /books/:id
export const updateBook = async (req, res, next) => {
  try {
    if (req.body.author) {
      const authorExists = await Author.findById(req.body.author);
      if (!authorExists) {
        res.status(404);
        return next(new Error('Author not found'));
      }
    }

    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!book) {
      res.status(404);
      return next(new Error('Book not found'));
    }

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

// DELETE /books/:id
export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404);
      return next(new Error('Book not found'));
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
