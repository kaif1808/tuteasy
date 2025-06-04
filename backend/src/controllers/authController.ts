import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  RefreshTokenInput,
  LogoutInput,
} from '../types/auth';

export class AuthController {
  // Register new user
  static async register(
    req: Request<{}, {}, RegisterInput>,
    res: Response
  ): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await AuthService.register(req.body);

      // TODO: Send verification email
      // await EmailService.sendVerificationEmail(user.email, user.emailVerificationToken);

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User already exists') {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  // Login user
  static async login(
    req: Request<{}, {}, LoginInput>,
    res: Response
  ): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await AuthService.login(req.body);

      res.json({
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            lastLoginAt: user.lastLoginAt,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === 'Invalid credentials' ||
          error.message === 'Account is locked. Please try again later.' ||
          error.message === 'Please verify your email before logging in'
        ) {
          res.status(401).json({ error: error.message });
          return;
        }
      }
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // Verify email
  static async verifyEmail(
    req: Request<{}, {}, {}, VerifyEmailInput>,
    res: Response
  ): Promise<void> {
    try {
      const { token } = req.query;
      const user = await AuthService.verifyEmail(token);

      res.json({
        message: 'Email verified successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid or expired verification token') {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Email verification failed' });
    }
  }

  // Request password reset
  static async requestPasswordReset(
    req: Request<{}, {}, RequestPasswordResetInput>,
    res: Response
  ): Promise<void> {
    try {
      const { email } = req.body;
      const user = await AuthService.requestPasswordReset(email);

      // TODO: Send password reset email
      // await EmailService.sendPasswordResetEmail(user.email, user.passwordResetToken);

      res.json({
        message: 'If a user with this email exists, a password reset link has been sent',
      });
    } catch (error) {
      // Always return success to prevent email enumeration
      res.json({
        message: 'If a user with this email exists, a password reset link has been sent',
      });
    }
  }

  // Reset password
  static async resetPassword(
    req: Request<{}, {}, ResetPasswordInput>,
    res: Response
  ): Promise<void> {
    try {
      const { token, password } = req.body;
      await AuthService.resetPassword(token, password);

      res.json({
        message: 'Password reset successful. Please login with your new password.',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid or expired reset token') {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Password reset failed' });
    }
  }

  // Refresh access token
  static async refreshToken(
    req: Request<{}, {}, RefreshTokenInput>,
    res: Response
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshAccessToken(refreshToken);

      res.json({
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'Invalid refresh token' ||
          error.message === 'Invalid or expired refresh token')
      ) {
        res.status(401).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }

  // Logout
  static async logout(
    req: Request<{}, {}, LogoutInput>,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { refreshToken } = req.body;
      await AuthService.logout(req.user.id, refreshToken);

      res.json({
        message: 'Logout successful',
      });
    } catch (error) {
      res.status(500).json({ error: 'Logout failed' });
    }
  }
} 