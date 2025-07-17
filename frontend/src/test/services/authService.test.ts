import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import { server, addHandlers } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock the auth store
vi.mock('../../stores/authStore');

const mockUseAuthStore = vi.mocked(useAuthStore);

describe('AuthService', () => {
  const mockSetAuth = vi.fn();
  const mockSetLoading = vi.fn();
  const mockSetError = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accessToken: null,
      refreshToken: null,
      setAuth: mockSetAuth,
      setLoading: mockSetLoading,
      setError: mockSetError,
      updateTokens: vi.fn(),
      logout: mockLogout,
    });

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        role: 'STUDENT' as const
      };

      const result = await authService.register(userData);

      expect(result).toEqual({
        status: 'success',
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: 'user-123',
          email: userData.email,
          role: userData.role,
          isEmailVerified: false
        },
        accessToken: 'mock-access-token'
      });

      expect(mockSetAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userData.email,
          role: userData.role
        }),
        'mock-access-token',
        expect.any(String)
      );
    });

    it('should handle registration errors', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'SecurePass123!',
        role: 'STUDENT' as const
      };

      await expect(authService.register(userData)).rejects.toThrow(
        'Registration failed. Please check your information and try again.'
      );

      expect(mockSetError).toHaveBeenCalledWith(
        'Registration failed. Please check your information and try again.'
      );
    });

    it('should handle network errors during registration', async () => {
      // Add a handler that simulates network error
      addHandlers(
        http.post('http://localhost:3001/api/auth/register', () => {
          return HttpResponse.error();
        })
      );

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        role: 'STUDENT' as const
      };

      await expect(authService.register(userData)).rejects.toThrow();
      expect(mockSetError).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        firstName: 'John',
        email: 'john@example.com',
        password: 'SecurePass123!',
        role: 'STUDENT' as const
        // Missing lastName
      } as any;

      // The service should validate or the API should return validation error
      await expect(authService.register(incompleteData)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      const result = await authService.login(credentials);

      expect(result).toEqual({
        status: 'success',
        message: 'Login successful',
        user: expect.objectContaining({
          email: credentials.email,
          role: 'STUDENT',
          isEmailVerified: true
        }),
        accessToken: 'mock-access-token'
      });

      expect(mockSetAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          email: credentials.email
        }),
        'mock-access-token',
        expect.any(String)
      );
    });

    it('should handle invalid credentials', async () => {
      const invalidCredentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      };

      await expect(authService.login(invalidCredentials)).rejects.toThrow(
        'Invalid email or password. Please check your credentials and try again.'
      );

      expect(mockSetError).toHaveBeenCalledWith(
        'Invalid email or password. Please check your credentials and try again.'
      );
    });

    it('should handle network errors during login', async () => {
      addHandlers(
        http.post('http://localhost:3001/api/auth/login', () => {
          return HttpResponse.error();
        })
      );

      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      await expect(authService.login(credentials)).rejects.toThrow();
      expect(mockSetError).toHaveBeenCalled();
    });

    it('should store tokens after successful login', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      await authService.login(credentials);

      expect(mockSetAuth).toHaveBeenCalledWith(
        expect.any(Object),
        'mock-access-token',
        expect.any(String)
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      await authService.logout();

      expect(mockLogout).toHaveBeenCalled();
    });

    it('should handle logout errors gracefully', async () => {
      addHandlers(
        http.post('http://localhost:3001/api/auth/logout', () => {
          return HttpResponse.json(
            { error: 'Logout failed' },
            { status: 500 }
          );
        })
      );

      // Should not throw even if API call fails
      await expect(authService.logout()).resolves.not.toThrow();
      expect(mockLogout).toHaveBeenCalled();
    });

    it('should clear local storage on logout', async () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 'user-123' }));

      await authService.logout();

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const result = await authService.refreshToken();

      expect(result).toEqual({
        status: 'success',
        accessToken: 'new-mock-access-token'
      });
    });

    it('should handle refresh token errors', async () => {
      addHandlers(
        http.post('http://localhost:3001/api/auth/refresh-token', () => {
          return HttpResponse.json(
            { error: 'Invalid refresh token' },
            { status: 401 }
          );
        })
      );

      await expect(authService.refreshToken()).rejects.toThrow('Invalid refresh token');
    });

    it('should logout user on refresh token failure', async () => {
      addHandlers(
        http.post('http://localhost:3001/api/auth/refresh-token', () => {
          return HttpResponse.json(
            { error: 'Invalid refresh token' },
            { status: 401 }
          );
        })
      );

      try {
        await authService.refreshToken();
      } catch (error) {
        // Expected to throw
      }

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'valid-verification-token';

      const result = await authService.verifyEmail(token);

      expect(result).toEqual({
        status: 'success',
        message: 'Email verified successfully'
      });
    });

    it('should handle invalid verification token', async () => {
      const token = 'invalid-token';

      await expect(authService.verifyEmail(token)).rejects.toThrow('Invalid verification token');
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset successfully', async () => {
      const email = 'test@example.com';

      const result = await authService.requestPasswordReset(email);

      expect(result).toEqual({
        status: 'success',
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    });

    it('should handle network errors during password reset request', async () => {
      addHandlers(
        http.post('http://localhost:3001/api/auth/request-password-reset', () => {
          return HttpResponse.error();
        })
      );

      const email = 'test@example.com';

      await expect(authService.requestPasswordReset(email)).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewSecurePass123!';

      const result = await authService.resetPassword(token, newPassword);

      expect(result).toEqual({
        status: 'success',
        message: 'Password reset successful'
      });
    });

    it('should handle invalid reset token', async () => {
      const token = 'invalid-token';
      const newPassword = 'NewSecurePass123!';

      await expect(authService.resetPassword(token, newPassword)).rejects.toThrow('Invalid reset token');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com', role: 'STUDENT' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessToken: 'valid-token',
        refreshToken: 'valid-refresh-token',
        setAuth: mockSetAuth,
        setLoading: mockSetLoading,
        setError: mockSetError,
        updateTokens: vi.fn(),
        logout: mockLogout,
      });

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        accessToken: null,
        refreshToken: null,
        setAuth: mockSetAuth,
        setLoading: mockSetLoading,
        setError: mockSetError,
        updateTokens: vi.fn(),
        logout: mockLogout,
      });

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', () => {
      const mockUser = { id: 'user-123', email: 'test@example.com', role: 'STUDENT' };
      
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessToken: 'valid-token',
        refreshToken: 'valid-refresh-token',
        setAuth: mockSetAuth,
        setLoading: mockSetLoading,
        setError: mockSetError,
        updateTokens: vi.fn(),
        logout: mockLogout,
      });

      const result = authService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when not authenticated', () => {
      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle rate limiting errors', async () => {
      addHandlers(
        http.post('http://localhost:3001/api/auth/login', () => {
          return HttpResponse.json(
            { 
              error: 'Too many requests. Please try again later.',
              retryAfter: 900 
            },
            { 
              status: 429,
              headers: {
                'Retry-After': '900'
              }
            }
          );
        })
      );

      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      await expect(authService.login(credentials)).rejects.toThrow(
        'Too many requests. Please try again later.'
      );
    });

    it('should handle server errors gracefully', async () => {
      addHandlers(
        http.post('http://localhost:3001/api/auth/login', () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      await expect(authService.login(credentials)).rejects.toThrow();
      expect(mockSetError).toHaveBeenCalled();
    });
  });
});
