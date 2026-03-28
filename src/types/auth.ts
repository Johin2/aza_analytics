/**
 * Authentication types for Aza Fashions Analytics Dashboard
 */

export interface User {
  id: number;
  email: string;
  name: string;
  preferences: UserPreferences;
  created_at?: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  defaultView?: string;
  notifications?: boolean;
  [key: string]: any;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  name: string;
  password: string;
  preferences?: UserPreferences;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
