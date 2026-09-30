import Author from '../models/authorModel.js';
import Book from '../models/bookModel.js';

// GET /authors
export const getAuthors = async (req, res, next) => {
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

    const total = await Author.countDocuments();
    const authors = await Author.find().skip(startIndex).limit(validLimit);

    res.status(200).json({
      data: authors,
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

// GET /authors/:id
export const getAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      res.status(404);
      return next(new Error('Author not found'));
    }

    const books = await Book.find({ author: req.params.id });

    res.status(200).json({
      data: {
        ...author._doc,
        books
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /authors
export const createAuthor = async (req, res, next) => {
  try {
    if (req.body.name !== undefined && typeof req.body.name !== 'string') {
      res.status(400);
      return next(new Error('Validation failed: name must be a string'));
    }
    const author = await Author.create(req.body);
    res.status(201).json({ data: author });
  } catch (error) {
    next(error);
  }
};

// PUT /authors/:id
export const updateAuthor = async (req, res, next) => {
  try {
    if (req.body.name !== undefined && typeof req.body.name !== 'string') {
      res.status(400);
      return next(new Error('Validation failed: name must be a string'));
    }
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!author) {
      res.status(404);
      return next(new Error('Author not found'));
    }

    res.status(200).json({ data: author });
  } catch (error) {
    next(error);
  }
};

// DELETE /authors/:id
export const deleteAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      res.status(404);
      return next(new Error('Author not found'));
    }

    // Check if author is referenced by any books
    const booksCount = await Book.countDocuments({ author: req.params.id });
    if (booksCount > 0) {
      res.status(409);
      return next(new Error('Cannot delete author because they are referenced by one or more books'));
    }

    await Author.findByIdAndDelete(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
