import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, initializeAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Initialize auth state on component mount
    initializeAuth();
  }, [initializeAuth]);

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 