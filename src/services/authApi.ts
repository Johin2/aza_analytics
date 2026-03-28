/**
 * Auth API service for Aza Fashions Analytics Dashboard
 */

import { LoginCredentials, SignupData, AuthResponse, User } from '../types/auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Storage keys for auth data
 */
const TOKEN_KEY = 'foo_auth_token';
const USER_KEY = 'foo_auth_user';

/**
 * Get stored auth token
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get stored user data
 */
export const getStoredUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Store auth data
 */
export const storeAuth = (token: string, user: User): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Clear stored auth data
 */
export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Login with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  storeAuth(data.access_token, data.user);
  return data;
};

/**
 * Signup with name, email, and password
 */
export const signup = async (signupData: SignupData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(signupData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Signup failed');
  }

  const data: AuthResponse = await response.json();
  storeAuth(data.access_token, data.user);
  return data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user profile');
  }

  return response.json();
};

/**
 * Verify token validity
 */
export const verifyToken = async (): Promise<boolean> => {
  const token = getStoredToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE}/api/auth/verify`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Logout - clear stored auth data
 */
export const logout = (): void => {
  clearAuth();
};
