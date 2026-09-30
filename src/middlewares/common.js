import Author from '../models/authorModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createError } from '../utils/errors.js';

export const paginateMiddleware = (req, res, next) => {
  let validPage = 1;
  let validLimit = 10;

  if (req.query.page !== undefined && req.query.page !== '') {
    const pageNum = Number(req.query.page);
    if (!Number.isInteger(pageNum) || pageNum < 1) {
      return next(createError(res, 400, 'Page must be a positive integer'));
    }
    validPage = pageNum;
  }

  if (req.query.limit !== undefined && req.query.limit !== '') {
    const limitNum = Number(req.query.limit);
    if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      return next(createError(res, 400, 'Limit must be a positive integer between 1 and 100'));
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
  if (req.body[fieldName] !== undefined && typeof req.body[fieldName] !== 'string') {
    return next(createError(res, 400, `Validation failed: ${fieldName} must be a string`));
  }
  next();
};

export const checkAuthorExists = asyncHandler(async (req, res, next) => {
  if (req.body.author) {
    const authorExists = await Author.findById(req.body.author);
    if (!authorExists) {
      return next(createError(res, 404, 'Author not found'));
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
    return next(createError(res, 404, `${Model.modelName} not found`));
  }
  req.document = document;
  next();
});

export const sanitizeCreateBody = (req, res, next) => {
  if (Array.isArray(req.body)) {
    return next(createError(res, 400, 'Request body must be a JSON object, not an array'));
  }
  if (req.body && req.body._id) {
    delete req.body._id;
  }
  next();
};
