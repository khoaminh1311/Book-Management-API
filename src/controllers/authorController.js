import Author from '../models/authorModel.js';
import Book from '../models/bookModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { filterAllowedFields } from '../utils/helpers.js';

const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// GET /authors
export const getAuthors = asyncHandler(async (req, res, next) => {
  const { validPage, validLimit, startIndex } = req.pagination;
  const query = {};

  if (req.query.search) {
    if (typeof req.query.search !== 'string') {
      return next(new AppError('Search parameter must be a single string', 400));
    }
    const safeSearch = escapeRegex(req.query.search);
    query.name = { $regex: safeSearch, $options: 'i' };
  }

  let sortOption = { createdAt: -1 };
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'name-asc':
        sortOption = { name: 1 };
        break;
      case 'name-desc':
        sortOption = { name: -1 };
        break;
      case 'year-asc':
        sortOption = { birthYear: 1 };
        break;
      case 'year-desc':
        sortOption = { birthYear: -1 };
        break;
      case 'recent':
      default:
        sortOption = { createdAt: -1 };
        break;
    }
  }

  const [total, authors] = await Promise.all([
    Author.countDocuments(query),
    Author.find(query).sort(sortOption).skip(startIndex).limit(validLimit)
  ]);

  res.status(200).json({
    data: authors,
    pagination: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages: Math.ceil(total / validLimit)
    }
  });
});

// GET /authors/:id
export const getAuthor = asyncHandler(async (req, res, next) => {
  const books = await Book.find({ author: req.params.id }).sort({ createdAt: -1 });

  const authorData = req.document.toObject();

  res.status(200).json({
    data: {
      ...authorData,
      books
    }
  });
});

const ALLOWED_FIELDS = ['name', 'bio', 'nationality', 'birthYear'];

// POST /authors
export const createAuthor = asyncHandler(async (req, res, next) => {
  const safeData = filterAllowedFields(req.body, ALLOWED_FIELDS);
  const author = await Author.create(safeData);
  res.status(201).json({ data: author });
});

// PUT /authors/:id
export const updateAuthor = asyncHandler(async (req, res, next) => {
  const safeUpdates = filterAllowedFields(req.body, ALLOWED_FIELDS);

  const author = await Author.findByIdAndUpdate(req.params.id, safeUpdates, {
    returnDocument: 'after',
    runValidators: true
  });

  if (!author) {
    return next(new AppError('Author not found', 404));
  }

  res.status(200).json({ data: author });
});

// DELETE /authors/:id
export const deleteAuthor = asyncHandler(async (req, res, next) => {
  // Check if author is referenced by any books
  const booksCount = await Book.countDocuments({ author: req.params.id });
  if (booksCount > 0) {
    return next(new AppError('Cannot delete author because they are referenced by one or more books', 409));
  }

  const author = await Author.findByIdAndDelete(req.params.id);
  if (!author) {
    return next(new AppError('Author not found', 404));
  }

  res.status(204).send();
});
