import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role?: string;
  };
}

/**
 * Check backend health and wake up the service if needed (for Render free tier)
 * This is a lightweight request that helps wake up sleeping services
 */
export const checkHealth = async (): Promise<void> => {
  try {
    // Use a shorter timeout for health check
    await apiClient.get('/health', { timeout: 10000 });
  } catch (error) {
    // Ignore health check errors - we'll still try the login
    // The service might be waking up, so we don't want to fail here
    console.log('Health check completed (service may be waking up)');
  }
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Wake up the service first if it's on Render free tier
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  if (API_URL.includes('onrender.com')) {
    await checkHealth();
    // Give the service a moment to fully wake up
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const response = await apiClient.post('/api/auth/login', credentials);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  // Wake up the service first if it's on Render free tier
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  if (API_URL.includes('onrender.com')) {
    await checkHealth();
    // Give the service a moment to fully wake up
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const response = await apiClient.post('/api/auth/register', data);
  return response.data;
};

