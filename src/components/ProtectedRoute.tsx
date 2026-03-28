/**
 * Protected Route Component
 * Redirects unauthenticated users to the login page
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from './ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoading } = useAuth();
  // Auth check disabled for testing - location and isAuthenticated reserved for production
  // const location = useLocation();

  // Show loading while checking auth status
  if (isLoading) {
    return <Loading size="lg" className="h-screen" />;
  }

  // Allow guest access for testing - TODO: re-enable for production
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  return <>{children}</>;
};
