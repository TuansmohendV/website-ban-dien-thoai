const AUTH_STORAGE_KEY = 'phonesin_auth';
const GUEST_STORAGE_KEY = 'phonesin_guest_id';

const isBrowser = typeof window !== 'undefined';

const safeJsonParse = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const createGuestId = () => {
  if (isBrowser && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const normalizeUser = (rawUser = {}) => {
  const normalizedId = rawUser._id || rawUser.id || '';

  return {
    ...rawUser,
    id: normalizedId,
    _id: normalizedId,
    name: rawUser.fullName || rawUser.name || 'Khach hang',
    fullName: rawUser.fullName || rawUser.name || 'Khach hang',
    email: rawUser.email || '',
    phone: rawUser.phone || '',
    avatar: rawUser.avatar || '',
    gender: rawUser.gender || 'other',
    dateOfBirth: rawUser.dateOfBirth || '',
    role: rawUser.role || 'user',
  };
};

export const getStoredAuth = () => {
  if (!isBrowser) {
    return {
      token: '',
      user: null,
    };
  }

  const storedAuth = safeJsonParse(
    window.localStorage.getItem(AUTH_STORAGE_KEY),
    {}
  );

  return {
    token: storedAuth?.token || '',
    user: storedAuth?.user ? normalizeUser(storedAuth.user) : null,
  };
};

export const setStoredAuth = ({ token = '', user = null } = {}) => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      token,
      user: user ? normalizeUser(user) : null,
    })
  );
};

export const updateStoredUser = (user) => {
  const currentAuth = getStoredAuth();
  setStoredAuth({
    token: currentAuth.token,
    user,
  });
};

export const clearStoredAuth = () => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const ensureGuestId = () => {
  if (!isBrowser) {
    return '';
  }

  const storedGuestId = window.localStorage.getItem(GUEST_STORAGE_KEY);

  if (storedGuestId) {
    return storedGuestId;
  }

  const nextGuestId = createGuestId();
  window.localStorage.setItem(GUEST_STORAGE_KEY, nextGuestId);
  return nextGuestId;
};

export const getGuestId = () => ensureGuestId();
