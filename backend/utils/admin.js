export const escapeRegex = (value = '') =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildRegex = (value = '') => new RegExp(escapeRegex(value), 'i');

export const parseBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'undefined') {
    return undefined;
  }

  const normalized = String(value).trim().toLowerCase();

  if (['true', '1'].includes(normalized)) {
    return true;
  }

  if (['false', '0'].includes(normalized)) {
    return false;
  }

  return undefined;
};

export const getPagination = (req, defaultLimit = 10, maxLimit = 100) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(
    Math.max(Number(req.query.limit) || defaultLimit, 1),
    maxLimit
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
