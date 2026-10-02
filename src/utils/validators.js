export const isValidPastYear = (value) => {
  if (value === undefined || value === null) return true;
  return Number.isInteger(value) && value > 0 && value <= new Date().getFullYear();
};

export const isValidUrl = (value) => {
  if (value === undefined || value === null || value === '') return true;
  return /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(value);
};
