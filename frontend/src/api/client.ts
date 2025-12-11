import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Log the API URL in development to help debug
if (import.meta.env.DEV) {
  console.log('API URL:', API_URL);
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (connection refused, timeout, etc.)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        error.message = 'Request timeout. Please check your connection and try again.';
      } else if (error.message === 'Network Error') {
        error.message = `Cannot connect to server. Please check that the backend is running at ${API_URL}`;
      } else {
        error.message = error.message || 'Network error. Please check your connection.';
      }
    }

    if (error.response?.status === 401) {
      // Don't redirect if the request was to login/register endpoints
      // Let those errors be handled by the component
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/login') || 
                             error.config?.url?.includes('/api/auth/register');
      
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

