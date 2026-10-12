import Book from '../models/bookModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
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
      return next(new AppError('Genre parameter must be a single string', 400));
    }
    const safeGenre = escapeRegex(req.query.genre);
    query.genre = { $regex: new RegExp('^' + safeGenre + '$', 'i') };
  }

  if (req.query.search) {
    if (typeof req.query.search !== 'string') {
      return next(new AppError('Search parameter must be a single string', 400));
    }
    const safeSearch = escapeRegex(req.query.search);
    query.title = { $regex: safeSearch, $options: 'i' };
  }

  let sortOption = { createdAt: -1 };
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'title-asc':
        sortOption = { title: 1 };
        break;
      case 'title-desc':
        sortOption = { title: -1 };
        break;
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'year-desc':
        sortOption = { publishedYear: -1 };
        break;
      case 'recent':
      default:
        sortOption = { createdAt: -1 };
        break;
    }
  }

  const [total, books, stats] = await Promise.all([
    Book.countDocuments(query),
    Book.find(query)
      .populate('author')
      .sort(sortOption)
      .skip(startIndex)
      .limit(validLimit),
    Book.aggregate([
      { $match: query },
      { $group: { _id: null, totalValue: { $sum: '$price' } } }
    ])
  ]);

  const totalCatalogValue = stats.length > 0 ? (stats[0].totalValue || 0) : 0;

  res.status(200).json({
    data: books,
    pagination: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages: Math.ceil(total / validLimit)
    },
    totalCatalogValue
  });
});

// GET /books/:id
export const getBook = asyncHandler(async (req, res, next) => {
  if (req.document.author === null) {
    return next(new AppError('Data integrity error: Referenced author no longer exists', 500));
  }

  res.status(200).json({ data: req.document });
});

const ALLOWED_FIELDS = ['title', 'description', 'genre', 'price', 'publishedYear', 'coverImage', 'author'];

// POST /books
export const createBook = asyncHandler(async (req, res, next) => {
  const safeData = filterAllowedFields(req.body, ALLOWED_FIELDS);
  const book = await Book.create(safeData);
  res.status(201).json({ data: book });
});

// PUT /books/:id
export const updateBook = asyncHandler(async (req, res, next) => {
  const safeUpdates = filterAllowedFields(req.body, ALLOWED_FIELDS);

  const book = await Book.findByIdAndUpdate(req.params.id, safeUpdates, {
    returnDocument: 'after',
    runValidators: true
  });

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  res.status(200).json({ data: book });
});

// DELETE /books/:id
export const deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) {
    return next(new AppError('Book not found', 404));
  }

  res.status(204).send();
});
