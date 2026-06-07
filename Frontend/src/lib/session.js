export const AUTH_TOKEN_KEY = 'authToken';
export const AUTH_USER_KEY = 'phonesin_user';
export const GUEST_ID_KEY = 'phonesin_guest_id';
export const GUEST_ORDER_IDS_KEY = 'phonesin_guest_orders';

const SESSION_SCOPED_KEYS = new Set([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
const LEGACY_SESSION_MIGRATED_KEY = 'phonesin_legacy_session_migrated';

const canUseLocalStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const canUseSessionStorage = () =>
  typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

const shouldUseSessionStorage = (key) => SESSION_SCOPED_KEYS.has(key);

export const getStorageItem = (key) => {
  if (shouldUseSessionStorage(key)) {
    if (!canUseSessionStorage()) {
      return '';
    }

    if (canUseLocalStorage() && !sessionStorage.getItem(LEGACY_SESSION_MIGRATED_KEY)) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      sessionStorage.setItem(LEGACY_SESSION_MIGRATED_KEY, '1');
    }

    const sessionValue = sessionStorage.getItem(key);

    if (sessionValue) {
      return sessionValue;
    }

    return '';
  }

  if (!canUseLocalStorage()) {
    return '';
  }

  return localStorage.getItem(key) || '';
};

export const setStorageItem = (key, value) => {
  if (shouldUseSessionStorage(key)) {
    if (!canUseSessionStorage()) {
      return;
    }

    if (value === undefined || value === null || value === '') {
      sessionStorage.removeItem(key);
      if (canUseLocalStorage()) {
        localStorage.removeItem(key);
      }
      return;
    }

    sessionStorage.setItem(key, value);
    if (canUseLocalStorage()) {
      localStorage.removeItem(key);
    }
    return;
  }

  if (!canUseLocalStorage()) {
    return;
  }

  if (value === undefined || value === null || value === '') {
    localStorage.removeItem(key);
    return;
  }

  localStorage.setItem(key, value);
};

export const removeStorageItem = (key) => {
  if (shouldUseSessionStorage(key)) {
    if (canUseSessionStorage()) {
      sessionStorage.removeItem(key);
    }

    if (canUseLocalStorage()) {
      localStorage.removeItem(key);
    }

    return;
  }

  if (!canUseLocalStorage()) {
    return;
  }

  localStorage.removeItem(key);
};

const buildRandomPart = () => Math.random().toString(36).slice(2, 10);

export const getGuestId = () => {
  if (!canUseLocalStorage()) {
    return `guest-${Date.now().toString(36)}`;
  }

  let guestId = localStorage.getItem(GUEST_ID_KEY);

  if (!guestId) {
    guestId = `guest-${Date.now().toString(36)}-${buildRandomPart()}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }

  return guestId;
};

export const normalizeUser = (rawUser = {}) => ({
  ...rawUser,
  id: rawUser._id || rawUser.id || '',
  backendId: rawUser._id || rawUser.id || '',
  name: rawUser.fullName || rawUser.name || 'Khach hang',
  fullName: rawUser.fullName || rawUser.name || 'Khach hang',
  phone: rawUser.phone || '',
  email: rawUser.email || '',
  avatar: rawUser.avatar || '',
  role: rawUser.role || 'customer',
  isAdmin: rawUser.role === 'admin' || rawUser.isAdmin === true,
  gender: rawUser.gender || 'other',
  dateOfBirth: rawUser.dateOfBirth || '',
  memberRank: rawUser.memberRank || 'New Member',
  points: Number(rawUser.points || 0),
  address: rawUser.address || '',
});

export const readStoredUser = () => {
  const rawValue = getStorageItem(AUTH_USER_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return normalizeUser(JSON.parse(rawValue));
  } catch {
    return null;
  }
};

export const persistSession = ({ token, user }) => {
  if (token) {
    setStorageItem(AUTH_TOKEN_KEY, token);
  }

  if (user) {
    setStorageItem(AUTH_USER_KEY, JSON.stringify(normalizeUser(user)));
  }
};

export const clearSession = () => {
  removeStorageItem(AUTH_TOKEN_KEY);
  removeStorageItem(AUTH_USER_KEY);
};

export const readGuestOrderIds = () => {
  const rawValue = getStorageItem(GUEST_ORDER_IDS_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

export const writeGuestOrderIds = (orderIds = []) => {
  const sanitized = [...new Set(orderIds.filter(Boolean))];
  setStorageItem(GUEST_ORDER_IDS_KEY, JSON.stringify(sanitized));
};
