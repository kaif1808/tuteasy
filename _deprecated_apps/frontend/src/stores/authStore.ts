import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import type { AuthState, User } from '../types/auth';
import type { 
  LoginFormData, 
  RegisterFormData, 
  ForgotPasswordFormData, 
  ResetPasswordFormData 
} from '../utils/validation';

interface AuthActions {
  // Authentication actions
  login: (credentials: LoginFormData) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  
  // Password reset actions
  forgotPassword: (data: ForgotPasswordFormData) => Promise<{ message: string }>;
  resetPassword: (data: ResetPasswordFormData) => Promise<{ message: string }>;
  
  // Email verification actions
  verifyEmail: (token: string) => Promise<{ message: string }>;
  resendVerificationEmail: () => Promise<{ message: string }>;
  
  // Profile actions
  refreshUser: () => Promise<void>;
  
  // State management actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Initialize auth state from storage
      initializeAuth: () => {
        const isAuthenticated = authService.isAuthenticated();
        const user = authService.getStoredUser();
        
        set({
          user,
          isAuthenticated,
          accessToken: isAuthenticated ? localStorage.getItem('accessToken') : null,
          refreshToken: isAuthenticated ? localStorage.getItem('refreshToken') : null,
        });
      },

      // Login action
      login: async (credentials: LoginFormData) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, accessToken, refreshToken } = await authService.login(credentials);
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      // Register action
      register: async (userData: RegisterFormData) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await authService.register(userData);
          
          set({
            isLoading: false,
            error: null,
          });
          
          return result;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
        } catch (error) {
          console.warn('Logout API call failed:', error);
        } finally {
          // Always clear state regardless of API call result
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Forgot password action
      forgotPassword: async (data: ForgotPasswordFormData) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await authService.forgotPassword(data);
          
          set({
            isLoading: false,
            error: null,
          });
          
          return result;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to send reset email',
          });
          throw error;
        }
      },

      // Reset password action
      resetPassword: async (data: ResetPasswordFormData) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await authService.resetPassword(data);
          
          set({
            isLoading: false,
            error: null,
          });
          
          return result;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to reset password',
          });
          throw error;
        }
      },

      // Verify email action
      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await authService.verifyEmail(token);
          
          // Refresh user data to get updated email verification status
          const currentUser = get().user;
          if (currentUser) {
            try {
              const updatedUser = await authService.getCurrentUser();
              set({ user: updatedUser });
            } catch (refreshError) {
              console.warn('Failed to refresh user after email verification:', refreshError);
            }
          }
          
          set({
            isLoading: false,
            error: null,
          });
          
          return result;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Email verification failed',
          });
          throw error;
        }
      },

      // Resend verification email action
      resendVerificationEmail: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await authService.resendVerificationEmail();
          
          set({
            isLoading: false,
            error: null,
          });
          
          return result;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to resend verification email',
          });
          throw error;
        }
      },

      // Refresh user profile
      refreshUser: async () => {
        if (!get().isAuthenticated) return;
        
        set({ isLoading: true, error: null });
        
        try {
          const user = await authService.getCurrentUser();
          
          set({
            user,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // If refresh fails due to authentication, logout
          if (error instanceof Error && error.message.includes('Authentication')) {
            get().logout();
          } else {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to refresh user profile',
            });
          }
          throw error;
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'tuteasy-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hook for easy access to auth state
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    // State
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    
    // Actions
    login: store.login,
    register: store.register,
    logout: store.logout,
    forgotPassword: store.forgotPassword,
    resetPassword: store.resetPassword,
    verifyEmail: store.verifyEmail,
    resendVerificationEmail: store.resendVerificationEmail,
    refreshUser: store.refreshUser,
    clearError: store.clearError,
    setLoading: store.setLoading,
    initializeAuth: store.initializeAuth,
  };
}; 