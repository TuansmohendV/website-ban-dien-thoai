import axios from 'axios';
import { clearStoredAuth, ensureGuestId, getStoredAuth } from './session';

const fallbackBaseUrl = 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl).trim(),
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const auth = getStoredAuth();
  const guestId = ensureGuestId();

  config.headers = config.headers || {};

  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  if (guestId) {
    config.headers['x-guest-id'] = guestId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getStoredAuth().token) {
      clearStoredAuth();
    }

    return Promise.reject(error);
  }
);

export const getApiMessage = (error, fallbackMessage = 'Da co loi xay ra.') =>
  error?.response?.data?.message || error?.message || fallbackMessage;
