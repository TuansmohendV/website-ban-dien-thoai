export const AUTH_TOKEN_KEY = 'authToken';
export const AUTH_USER_KEY = 'phonesin_user';
export const GUEST_ID_KEY = 'phonesin_guest_id';
export const GUEST_ORDER_IDS_KEY = 'phonesin_guest_orders';

const canUseLocalStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const canUseSessionStorage = () =>
  typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

/** Auth keys use sessionStorage so each browser tab can stay logged in as a different user. localStorage is shared across tabs on the same origin (e.g. two Cursor previews on localhost), which overwrote one login with the other. */
const isAuthKey = (key) => key === AUTH_TOKEN_KEY || key === AUTH_USER_KEY;

export const getStorageItem = (key) => {
  if (isAuthKey(key)) {
    if (!canUseSessionStorage()) {
      return '';
    }
    const fromSession = sessionStorage.getItem(key);
    if (fromSession) {
      return fromSession;
    }
    // One-time lift from legacy localStorage (shared across tabs).
    if (canUseLocalStorage()) {
      const legacy = localStorage.getItem(key);
      if (legacy) {
        sessionStorage.setItem(key, legacy);
        localStorage.removeItem(key);
        return legacy;
      }
    }
    return '';
  }

  if (!canUseLocalStorage()) {
    return '';
  }

  return localStorage.getItem(key) || '';
};

export const setStorageItem = (key, value) => {
  if (isAuthKey(key)) {
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
  if (isAuthKey(key)) {
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
