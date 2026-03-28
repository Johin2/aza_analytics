/**
 * Authentication Context for Aza Fashions Analytics Dashboard
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, SignupData } from '../types/auth';
import * as authApi from '../services/authApi';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: authApi.getStoredUser(),
    token: authApi.getStoredToken(),
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Verify token on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = authApi.getStoredToken();
      const user = authApi.getStoredUser();

      if (token && user) {
        try {
          const isValid = await authApi.verifyToken();
          if (isValid) {
            setState({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Token invalid, clear auth
            authApi.clearAuth();
            setState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch {
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    verifyAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.login(credentials);
      setState({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Login failed',
      }));
      throw err;
    }
  };

  const signup = async (data: SignupData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.signup(data);
      setState({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Signup failed',
      }));
      throw err;
    }
  };

  const logout = () => {
    authApi.logout();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const updateUser = (updates: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...updates };
      authApi.storeAuth(state.token!, updatedUser);
      setState(prev => ({ ...prev, user: updatedUser }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
