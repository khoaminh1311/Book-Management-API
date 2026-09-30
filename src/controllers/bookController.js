import Book from '../models/bookModel.js';
import Author from '../models/authorModel.js';

const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// GET /books
export const getBooks = async (req, res, next) => {
  try {
    let validPage = 1;
    let validLimit = 10;

    if (req.query.page !== undefined && req.query.page !== '') {
      const pageNum = Number(req.query.page);
      if (!Number.isInteger(pageNum) || pageNum < 1) {
        res.status(400);
        return next(new Error('Page must be a positive integer'));
      }
      validPage = pageNum;
    }

    if (req.query.limit !== undefined && req.query.limit !== '') {
      const limitNum = Number(req.query.limit);
      if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
        res.status(400);
        return next(new Error('Limit must be a positive integer between 1 and 100'));
      }
      validLimit = limitNum;
    }
    
    const startIndex = (validPage - 1) * validLimit;

    const query = {};

    if (req.query.genre) {
      if (Array.isArray(req.query.genre)) {
        res.status(400);
        return next(new Error('Genre parameter must be a single string, not an array'));
      }
      const safeGenre = escapeRegex(req.query.genre);
      query.genre = { $regex: new RegExp('^' + safeGenre + '$', 'i') };
    }

    if (req.query.search) {
      if (Array.isArray(req.query.search)) {
        res.status(400);
        return next(new Error('Search parameter must be a single string, not an array'));
      }
      const safeSearch = escapeRegex(req.query.search);
      query.title = { $regex: safeSearch, $options: 'i' };
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query).skip(startIndex).limit(validLimit);

    res.status(200).json({ 
      data: books,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages: Math.ceil(total / validLimit)
      }
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

    if (book.author === null) {
      res.status(500);
      return next(new Error('Data integrity error: Referenced author no longer exists'));
    }

    res.status(200).json({ data: book });
  } catch (error) {
    next(error);
  }
};

// POST /books
export const createBook = async (req, res, next) => {
  try {
    if (req.body.title !== undefined && typeof req.body.title !== 'string') {
      res.status(400);
      return next(new Error('Validation failed: title must be a string'));
    }

    if (req.body.author) {
      const authorExists = await Author.findById(req.body.author);
      if (!authorExists) {
        res.status(404);
        return next(new Error('Author not found'));
      }
    }

    const book = await Book.create(req.body);
    res.status(201).json({ data: book });
  } catch (error) {
    next(error);
  }
};

// PUT /books/:id
export const updateBook = async (req, res, next) => {
  try {
    if (req.body.title !== undefined && typeof req.body.title !== 'string') {
      res.status(400);
      return next(new Error('Validation failed: title must be a string'));
    }

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

    res.status(200).json({ data: book });
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

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
