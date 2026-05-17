import axios from 'axios';

// Create a regular axios instance for general use
const axiosInstance = axios.create();

// Create a specific axios instance for VITE_BE_URL API calls with error handling
const backendApiInstance = axios.create();

// Function to clear authentication data and redirect to login
const clearAuthAndRedirect = () => {
  // Clear all authentication-related localStorage items
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('roles');
  localStorage.removeItem('currentContest');
  
  // Redirect to login page
  window.location.href = '/login';
};

// Add a request interceptor to both instances for token injection
const addTokenInterceptor = (instance) => {
  instance.interceptors.request.use(
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
};

// Add token interceptor to both instances
addTokenInterceptor(axiosInstance);
addTokenInterceptor(backendApiInstance);

// Add error handling response interceptor ONLY to backendApiInstance
backendApiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('=== Backend API Error Details ===');
    console.log('Error object:', error);
    console.log('Error response:', error.response);
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Error headers:', error.response?.headers);
    console.log('Current token:', localStorage.getItem('token'));
    console.log('========================');
    
    // Handle server response errors
    if (error.response) {
      const status = error.response.status;
      
      // Handle authentication related errors (401, 403) and server errors (500)
      if (status === 401 || status === 403 || status === 500) {
        console.log(`Handling ${status} response - clearing storage and redirecting to login`);
        
        // Use the helper function to clear auth and redirect
        clearAuthAndRedirect();
        return Promise.reject(error);
      }
      
      // Handle 404 errors separately without clearing auth
      if (status === 404) {
        console.log('Handling 404 response - resource not found');
        // Don't clear auth for 404 errors, just pass the error through
      }
    }
    
    // Handle network errors or timeouts
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.log('Network error detected - request failed to reach server');
      // For network errors, we don't clear auth as it might be a temporary connectivity issue
    }
    
    return Promise.reject(error);
  }
);

// Regular axiosInstance has no special error handling (for contest/discussion APIs)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // No special error handling - just pass through
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { backendApiInstance, clearAuthAndRedirect }; 