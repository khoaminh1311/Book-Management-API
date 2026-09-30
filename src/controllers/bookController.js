import Book from '../models/bookModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createError } from '../utils/errors.js';
import { filterAllowedFields } from '../utils/helpers.js';

const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// GET /books
export const getBooks = asyncHandler(async (req, res, next) => {
  const { validPage, validLimit, startIndex } = req.pagination;
  const query = {};

  if (req.query.genre) {
    if (typeof req.query.genre !== 'string') {
      return next(createError(res, 400, 'Genre parameter must be a single string'));
    }
    const safeGenre = escapeRegex(req.query.genre);
    query.genre = { $regex: new RegExp('^' + safeGenre + '$', 'i') };
  }

  if (req.query.search) {
    if (typeof req.query.search !== 'string') {
      return next(createError(res, 400, 'Search parameter must be a single string'));
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
});

// GET /books/:id
export const getBook = asyncHandler(async (req, res, next) => {
  if (req.document.author === null) {
    return next(createError(res, 500, 'Data integrity error: Referenced author no longer exists'));
  }

  res.status(200).json({ data: req.document });
});

export const createBook = asyncHandler(async (req, res, next) => {
  const book = await Book.create(req.body);
  res.status(201).json({ data: book });
});

// PUT /books/:id
export const updateBook = asyncHandler(async (req, res, next) => {
  const ALLOWED_FIELDS = ['title', 'description', 'genre', 'price', 'publishedYear', 'author'];
  const safeUpdates = filterAllowedFields(req.body, ALLOWED_FIELDS);

  const book = await Book.findByIdAndUpdate(req.params.id, safeUpdates, {
    returnDocument: 'after',
    runValidators: true
  });
  res.status(200).json({ data: book });
});

// DELETE /books/:id
export const deleteBook = asyncHandler(async (req, res, next) => {
  await Book.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
