import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
});

let authToken = null;
let unauthorizedHandler = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// AuthContext registers logout here so an expired/invalid token ends the session everywhere
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

// Reads a readable message from the backend's {message} error body
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) {
    return data;
  }
  if (data?.message) {
    return data.message;
  }
  if (!error?.response) {
    return 'Unable to reach the server. Please check that the backend is running.';
  }
  return fallback;
};

api.interceptors.request.use(
  (config) => {
    if (authToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const sentToken = Boolean(error.config?.headers?.['Authorization']);
    // Only a 401 for a request that carried our token means the session is no longer valid
    if (error.response?.status === 401 && sentToken && authToken) {
      setAuthToken(null);
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

export default api;
