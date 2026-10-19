export const MIN_YEAR = 1000;

export const isValidPastYear = (value) => {
  if (value === undefined || value === null) return true;
  return Number.isInteger(value) && value >= MIN_YEAR && value <= new Date().getFullYear();
};

export const isValidUrl = (value) => {
  if (value === undefined || value === null || value === '') return true;
  return /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(value);
};
