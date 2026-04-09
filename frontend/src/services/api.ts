import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const AUTH_TOKEN_STORAGE_KEY = 'payment_billing_auth_token';
export const AUTH_USER_STORAGE_KEY = 'payment_billing_auth_user';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    || window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      window.sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;