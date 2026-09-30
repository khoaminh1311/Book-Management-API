export const createError = (res, statusCode, message) => {
  res.status(statusCode);
  return new Error(message);
};
