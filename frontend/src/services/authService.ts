import { api } from './api';
import { useAuthStore, UserRole } from '../stores/authStore';

interface RegisterData {
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: UserRole;
      isEmailVerified: boolean;
      lastLoginAt?: Date | null;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    const { user, accessToken, refreshToken } = response.data.data;
    
    // Store auth data
    useAuthStore.getState().setAuth(user, accessToken, refreshToken);
    
    return response.data;
  },
  
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    const { user, accessToken, refreshToken } = response.data.data;
    
    // Store auth data
    useAuthStore.getState().setAuth(user, accessToken, refreshToken);
    
    return response.data;
  },
  
  async verifyEmail(token: string): Promise<void> {
    await api.get(`/auth/verify-email?token=${token}`);
  },
  
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/request-password-reset', { email });
  },
  
  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },
  
  async logout(): Promise<void> {
    const refreshToken = useAuthStore.getState().refreshToken;
    
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      useAuthStore.getState().logout();
    }
  },
}; 