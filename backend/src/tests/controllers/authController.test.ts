import request from 'supertest';
import express from 'express';
import { AuthController } from '../../controllers/authController';
import { AuthService } from '../../services/authService';
import { UserRole } from '@prisma/client';

// Mock dependencies
jest.mock('../../services/authService');

describe('AuthController', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    beforeEach(() => {
      app.post('/register', AuthController.register);
    });

    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.STUDENT,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      AuthService.prototype.register = jest.fn().mockResolvedValue({
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken
      });

      const response = await request(app)
        .post('/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          password: 'SecurePass123!',
          role: 'STUDENT'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        status: 'success',
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          isEmailVerified: mockUser.isEmailVerified
        },
        accessToken: mockTokens.accessToken
      });

      // Verify refresh token cookie is set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refreshToken');
      expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          email: 'invalid-email',
          password: '123', // Too short
          role: 'INVALID_ROLE'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 409 for existing user', async () => {
      AuthService.prototype.register = jest.fn().mockRejectedValue(
        new Error('User already exists')
      );

      const response = await request(app)
        .post('/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'existing@example.com',
          password: 'SecurePass123!',
          role: 'STUDENT'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Registration failed. Please check your information and try again.');
    });

    it('should handle service errors gracefully', async () => {
      AuthService.prototype.register = jest.fn().mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .post('/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          password: 'SecurePass123!',
          role: 'STUDENT'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Registration failed. Please check your information and try again.');
    });
  });

  describe('POST /login', () => {
    beforeEach(() => {
      app.post('/login', AuthController.login);
    });

    it('should login user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.STUDENT,
        isEmailVerified: true,
        lastLoginAt: new Date()
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      AuthService.prototype.login = jest.fn().mockResolvedValue({
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken
      });

      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'Login successful',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          isEmailVerified: mockUser.isEmailVerified,
          lastLoginAt: mockUser.lastLoginAt
        },
        accessToken: mockTokens.accessToken
      });

      // Verify refresh token cookie is set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refreshToken');
    });

    it('should return 401 for invalid credentials', async () => {
      AuthService.prototype.login = jest.fn().mockRejectedValue(
        new Error('Invalid credentials')
      );

      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password. Please check your credentials and try again.');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com'
          // Missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /refresh-token', () => {
    beforeEach(() => {
      app.post('/refresh-token', AuthController.refreshToken);
    });

    it('should refresh tokens successfully', async () => {
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      AuthService.prototype.refreshToken = jest.fn().mockResolvedValue(mockTokens);

      const response = await request(app)
        .post('/refresh-token')
        .set('Cookie', ['refreshToken=valid-refresh-token']);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        accessToken: mockTokens.accessToken
      });

      // Verify new refresh token cookie is set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refreshToken');
    });

    it('should return 401 for missing refresh token', async () => {
      const response = await request(app)
        .post('/refresh-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Refresh token required');
    });

    it('should return 401 for invalid refresh token', async () => {
      AuthService.prototype.refreshToken = jest.fn().mockRejectedValue(
        new Error('Invalid refresh token')
      );

      const response = await request(app)
        .post('/refresh-token')
        .set('Cookie', ['refreshToken=invalid-token']);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid refresh token');
    });
  });

  describe('POST /logout', () => {
    beforeEach(() => {
      app.post('/logout', AuthController.logout);
    });

    it('should logout user successfully', async () => {
      AuthService.prototype.logout = jest.fn().mockResolvedValue(undefined);

      const response = await request(app)
        .post('/logout')
        .set('Cookie', ['refreshToken=valid-refresh-token']);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'Logout successful'
      });

      // Verify refresh token cookie is cleared
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refreshToken=;');
    });

    it('should handle logout without refresh token', async () => {
      const response = await request(app)
        .post('/logout');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'Logout successful'
      });
    });
  });

  describe('POST /verify-email', () => {
    beforeEach(() => {
      app.post('/verify-email', AuthController.verifyEmail);
    });

    it('should verify email successfully', async () => {
      AuthService.prototype.verifyEmail = jest.fn().mockResolvedValue(undefined);

      const response = await request(app)
        .post('/verify-email')
        .send({
          token: 'valid-verification-token'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'Email verified successfully'
      });
    });

    it('should return 400 for invalid token', async () => {
      AuthService.prototype.verifyEmail = jest.fn().mockRejectedValue(
        new Error('Invalid verification token')
      );

      const response = await request(app)
        .post('/verify-email')
        .send({
          token: 'invalid-token'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid verification token');
    });
  });

  describe('POST /request-password-reset', () => {
    beforeEach(() => {
      app.post('/request-password-reset', AuthController.requestPasswordReset);
    });

    it('should request password reset successfully', async () => {
      AuthService.prototype.requestPasswordReset = jest.fn().mockResolvedValue(undefined);

      const response = await request(app)
        .post('/request-password-reset')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    });

    it('should return same response for non-existent email', async () => {
      AuthService.prototype.requestPasswordReset = jest.fn().mockRejectedValue(
        new Error('User not found')
      );

      const response = await request(app)
        .post('/request-password-reset')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    });
  });

  describe('POST /reset-password', () => {
    beforeEach(() => {
      app.post('/reset-password', AuthController.resetPassword);
    });

    it('should reset password successfully', async () => {
      AuthService.prototype.resetPassword = jest.fn().mockResolvedValue(undefined);

      const response = await request(app)
        .post('/reset-password')
        .send({
          token: 'valid-reset-token',
          newPassword: 'NewSecurePass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'Password reset successful'
      });
    });

    it('should return 400 for invalid token', async () => {
      AuthService.prototype.resetPassword = jest.fn().mockRejectedValue(
        new Error('Invalid reset token')
      );

      const response = await request(app)
        .post('/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'NewSecurePass123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid reset token');
    });
  });
});
