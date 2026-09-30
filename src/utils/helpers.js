export const filterAllowedFields = (body, allowedFields) => {
  const safeUpdates = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      safeUpdates[field] = body[field];
    }
  }
  return safeUpdates;
};
