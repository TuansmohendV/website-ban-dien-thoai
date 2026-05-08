import axios from 'axios';
import { getGuestId, getStorageItem, AUTH_TOKEN_KEY } from './session';

const normalizeBaseUrl = (value = '') => String(value).trim().replace(/\/+$/, '');

const resolvedBaseUrl =
  normalizeBaseUrl(import.meta.env.VITE_API_URL) ||
  (import.meta.env.DEV ? 'http://localhost:8080' : '');

const api = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getStorageItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['x-guest-id'] = getGuestId();

  return config;
});

export const getApiErrorMessage = (error, fallback = 'Da xay ra loi.') =>
  error?.response?.data?.message || fallback;

export default api;
