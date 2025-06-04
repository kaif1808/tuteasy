import httpClient, { handleApiError, setTokens, clearTokens } from './httpClient';
import type { AuthResponse, User } from '../types/auth';
import type { 
  LoginFormData, 
  RegisterFormData, 
  ForgotPasswordFormData, 
  ResetPasswordFormData 
} from '../utils/validation';

class AuthService {
  // Login user
  async login(credentials: LoginFormData): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    try {
      const response = await httpClient.post<AuthResponse>('/api/v1/auth/login', credentials);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Login failed');
      }

      const { user, accessToken, refreshToken } = response.data.data;
      
      // Store tokens
      setTokens(accessToken, refreshToken);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(user));

      return { user, accessToken, refreshToken };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Register new user
  async register(userData: RegisterFormData): Promise<{ message: string }> {
    try {
      const response = await httpClient.post<AuthResponse>('/api/v1/auth/register', userData);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Registration failed');
      }

      return { message: response.data.message || 'Registration successful' };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Call backend to invalidate refresh token
      await httpClient.post('/api/v1/auth/logout');
    } catch (error) {
      // Even if backend call fails, clear local storage
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      clearTokens();
    }
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordFormData): Promise<{ message: string }> {
    try {
      const response = await httpClient.post<AuthResponse>('/api/v1/auth/forgot-password', data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to send reset email');
      }

      return { message: response.data.message || 'Password reset email sent' };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Reset password
  async resetPassword(data: ResetPasswordFormData): Promise<{ message: string }> {
    try {
      const response = await httpClient.post<AuthResponse>('/api/v1/auth/reset-password', data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to reset password');
      }

      return { message: response.data.message || 'Password reset successful' };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await httpClient.post<AuthResponse>('/api/v1/auth/verify-email', { token });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Email verification failed');
      }

      return { message: response.data.message || 'Email verified successfully' };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Resend verification email
  async resendVerificationEmail(): Promise<{ message: string }> {
    try {
      const response = await httpClient.post<AuthResponse>('/api/v1/auth/resend-verification');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to resend verification email');
      }

      return { message: response.data.message || 'Verification email sent' };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    try {
      const response = await httpClient.get<AuthResponse>('/api/v1/auth/profile');
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get user profile');
      }

      const user = response.data.data.user;
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Check if user is authenticated (has valid token)
  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get stored user data
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData) as User;
      }
      return null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  // Check email availability
  async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    try {
      const response = await httpClient.get<{ success: boolean; data: { available: boolean } }>(
        `/api/v1/auth/check-email?email=${encodeURIComponent(email)}`
      );
      
      if (!response.data.success) {
        throw new Error('Failed to check email availability');
      }

      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService; 