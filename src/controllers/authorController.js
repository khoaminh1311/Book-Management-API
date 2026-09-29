import Author from '../models/authorModel.js';
import Book from '../models/bookModel.js';

// GET /authors
export const getAuthors = async (req, res, next) => {
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

    const total = await Author.countDocuments();
    const authors = await Author.find().skip(startIndex).limit(validLimit);

    res.status(200).json({
      success: true,
      count: authors.length,
      pagination: {
        total,
        page: validPage,
        pages: Math.ceil(total / validLimit)
      },
      data: authors
    });
  } catch (error) {
    next(error);
  }
};

// POST /authors
export const createAuthor = async (req, res, next) => {
  try {
    const author = await Author.create(req.body);
    res.status(201).json({ success: true, data: author });
  } catch (error) {
    next(error);
  }
};

// PUT /authors/:id
export const updateAuthor = async (req, res, next) => {
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!author) {
      res.status(404);
      return next(new Error('Author not found'));
    }

    res.status(200).json({ success: true, data: author });
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

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
