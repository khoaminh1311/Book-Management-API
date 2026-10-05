import Author from '../models/authorModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';

export const paginateMiddleware = (req, res, next) => {
  let validPage = 1;
  let validLimit = 10;

  if (req.query.page !== undefined && req.query.page !== '') {
    const pageNum = Number(req.query.page);
    if (!Number.isInteger(pageNum) || pageNum < 1) {
      return next(new AppError('Page must be a positive integer', 400));
    }
    validPage = pageNum;
  }

  if (req.query.limit !== undefined && req.query.limit !== '') {
    const limitNum = Number(req.query.limit);
    if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      return next(new AppError('Limit must be a positive integer between 1 and 100', 400));
    }
    validLimit = limitNum;
  }

  req.pagination = {
    validPage,
    validLimit,
    startIndex: (validPage - 1) * validLimit
  };
  next();
};

export const validateStringField = (fieldName) => (req, res, next) => {
  const body = req.body || {};
  if (body[fieldName] !== undefined && typeof body[fieldName] !== 'string') {
    return next(new AppError(`Validation failed: ${fieldName} must be a string`, 400));
  }
  next();
};

export const checkAuthorExists = asyncHandler(async (req, res, next) => {
  const body = req.body || {};
  if (body.author) {
    const authorExists = await Author.findById(body.author);
    if (!authorExists) {
      return next(new AppError('Author not found', 404));
    }
  }
  next();
});

export const checkDocumentExists = (Model, populateOpts) => asyncHandler(async (req, res, next) => {
  let query = Model.findById(req.params.id);
  if (populateOpts) {
    query = query.populate(populateOpts);
  }
  const document = await query;
  if (!document) {
    return next(new AppError(`${Model.modelName} not found`, 404));
  }
  req.document = document;
  next();
});

export const sanitizeCreateBody = (req, res, next) => {
  if (Array.isArray(req.body)) {
    return next(new AppError('Request body must be a JSON object, not an array', 400));
  }
  if (req.body && req.body._id) {
    delete req.body._id;
  }
  next();
};
