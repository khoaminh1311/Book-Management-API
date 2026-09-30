export const isValidPastYear = (value) => {
  if (value === undefined || value === null) return true;
  return Number.isInteger(value) && value > 0 && value <= new Date().getFullYear();
};

export const isValidOptionalInteger = (value) => {
  if (value === undefined || value === null) return true;
  return Number.isInteger(value);
};
