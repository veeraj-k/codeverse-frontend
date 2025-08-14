import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create();

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
    console.log('=== Axios Error Details ===');
    console.log('Error object:', error);
    console.log('Error response:', error.response);
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Error headers:', error.response?.headers);
    console.log('Current token:', localStorage.getItem('token'));
    console.log('========================');
    
    // Handle server response errors
    if (error.response) {
      // Handle token expiration (401 Unauthorized) or Not Found (404)
      if (error.response.status === 401 || error.response.status === 404) {
        console.log('Handling 401/404 response - clearing storage');
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('roles');
        
        // Force reload the page to clear any cached state
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 