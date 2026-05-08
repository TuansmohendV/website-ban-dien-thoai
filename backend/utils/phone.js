export const normalizePhone = (value = '') => {
  return value.replace(/[^\d+]/g, '').trim();
};
