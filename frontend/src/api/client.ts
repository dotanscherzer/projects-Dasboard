import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Log the API URL to help debug (both dev and prod)
console.log('API URL:', API_URL);

// Warn if using localhost in production
if (!import.meta.env.DEV && API_URL.includes('localhost')) {
  console.warn('⚠️ Warning: API URL is set to localhost in production. Please set VITE_API_URL environment variable in Netlify.');
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout (increased for Render free tier wake-up time)
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

// Handle errors with retry logic for Render free tier wake-up
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors (connection refused, timeout, etc.)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        // Check if API URL is misconfigured
        if (API_URL.includes('localhost') && !import.meta.env.DEV) {
          error.message = 'Request timeout. The backend URL appears to be misconfigured. Please check your VITE_API_URL environment variable in Netlify.';
        } else if (API_URL.includes('onrender.com')) {
          // Render free tier services can take time to wake up
          error.message = 'Request timeout. The backend service may be waking up (Render free tier). Please try again in a few seconds.';
        } else {
          error.message = 'Request timeout. Please check your connection and try again.';
        }
      } else if (error.message === 'Network Error') {
        if (API_URL.includes('localhost') && !import.meta.env.DEV) {
          error.message = `Cannot connect to server. The backend URL is set to localhost. Please configure VITE_API_URL in Netlify to point to your backend (e.g., https://your-backend.onrender.com)`;
        } else if (API_URL.includes('onrender.com')) {
          error.message = `Cannot connect to server. The backend service may be sleeping (Render free tier). It will wake up automatically, please try again.`;
        } else {
          error.message = `Cannot connect to server. Please check that the backend is running at ${API_URL}`;
        }
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

