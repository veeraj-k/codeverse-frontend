import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create();

// Prevent duplicate logout redirects
let isLoggingOut = false;

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error?.response?.status;

    // Auto logout on auth errors only
    if (status === 401 || status === 403) {
      if (!isLoggingOut) {
        isLoggingOut = true;
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
          localStorage.removeItem('roles');
        } catch (_) {
          // ignore storage errors
        }
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        } else {
          // Already on login page; force state reset without navigation
          window.location.reload();
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 