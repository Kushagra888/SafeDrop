import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:6600';

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // For file uploads, let the browser set the correct Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data?.error || error.response.data?.message || 'An error occurred';
      error.message = errorMessage;
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // No response received
      error.message = 'No response from server. Please try again.';
    } else {
      // Request setup error
      error.message = 'Request failed. Please try again.';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;