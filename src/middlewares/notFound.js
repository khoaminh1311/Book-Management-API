import { AppError } from '../utils/errors.js';

export const notFound = (req, res, next) => {
  next(new AppError(`Not Found - ${req.originalUrl}`, 404));
};
