import axios from 'axios';

const TOKEN_KEY = 'lifepilot_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 90_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      window.dispatchEvent(new CustomEvent('lifepilot:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (error) => {
  if (!error) return 'Something went wrong. Please try again.';
  if (error.code === 'ECONNABORTED') {
    return 'The request took too long. The AI may be busy — please try again.';
  }
  if (!error.response) {
    return 'Cannot reach the server. Check that the API is running and try again.';
  }
  return (
    error.response.data?.message ||
    error.response.data?.error ||
    'Something went wrong. Please try again.'
  );
};

export const errorCode = (error) => error?.response?.data?.code || null;

export const isAiSetupError = (error) =>
  ['AI_NOT_CONFIGURED', 'AI_AUTH_FAILED', 'AI_MODEL_ERROR'].includes(errorCode(error));
