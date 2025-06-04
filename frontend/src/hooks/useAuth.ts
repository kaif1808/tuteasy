import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, setLoading, setError } = useAuthStore();

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state and redirect
      useAuthStore.getState().logout();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate, setLoading]);

  const checkAuth = useCallback(() => {
    const { accessToken, refreshToken } = useAuthStore.getState();
    
    if (!accessToken || !refreshToken) {
      return false;
    }

    // TODO: Check token expiry
    return true;
  }, []);

  return {
    user,
    isAuthenticated,
    logout,
    checkAuth,
    setError,
  };
}; 