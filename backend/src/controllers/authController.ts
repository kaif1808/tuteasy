import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { EmailService } from '../services/emailService';
import { setRefreshTokenCookie, clearRefreshTokenCookie, getRefreshTokenFromCookie } from '../utils/cookieUtils';
import { logRegistrationAttempt, logLoginAttempt, logPasswordResetRequest, logTokenRefresh, logLogout } from '../utils/securityLogger';
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
    const { email } = req.body;

    try {
      const { user, accessToken, refreshToken } = await AuthService.register(req.body);

      // Set refresh token as HttpOnly cookie
      setRefreshTokenCookie(res, refreshToken);

      // Log successful registration
      logRegistrationAttempt(req, email, true, undefined, user.id);

      // Send verification email
      if ((user as any).emailVerificationToken) {
        try {
          await EmailService.sendVerificationEmail(user.email, (user as any).emailVerificationToken);
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
          // Don't fail registration if email fails
        }
      }

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
          // refreshToken removed from response body for security
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log failed registration
      logRegistrationAttempt(req, email, false, errorMessage);

      if (error instanceof Error && error.message === 'User already exists') {
        // Generic message to prevent email enumeration
        res.status(400).json({ error: 'Registration failed. Please check your information and try again.' });
        return;
      }
      res.status(500).json({ error: 'Registration failed. Please try again later.' });
    }
  }

  // Login user
  static async login(
    req: Request<{}, {}, LoginInput>,
    res: Response
  ): Promise<void> {
    const { email } = req.body;

    try {
      const { user, accessToken, refreshToken } = await AuthService.login(req.body);

      // Set refresh token as HttpOnly cookie
      setRefreshTokenCookie(res, refreshToken);

      // Log successful login
      logLoginAttempt(req, email, true, undefined, user.id);

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
          // refreshToken removed from response body for security
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log failed login attempt
      logLoginAttempt(req, email, false, errorMessage);

      if (error instanceof Error) {
        if (
          error.message === 'Invalid credentials' ||
          error.message === 'Account is locked. Please try again later.' ||
          error.message === 'Please verify your email before logging in'
        ) {
          // Generic message to prevent user enumeration
          res.status(401).json({ error: 'Invalid email or password. Please check your credentials and try again.' });
          return;
        }
      }
      res.status(500).json({ error: 'Login failed. Please try again later.' });
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

      // Send welcome email after successful verification
      try {
        await EmailService.sendWelcomeEmail(user.email, user.role);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail verification if welcome email fails
      }

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

      // Send password reset email
      if ((user as any).passwordResetToken) {
        try {
          await EmailService.sendPasswordResetEmail(user.email, (user as any).passwordResetToken);
        } catch (emailError) {
          console.error('Failed to send password reset email:', emailError);
          // Don't fail the request if email fails
        }
      }

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
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      // Get refresh token from HttpOnly cookie instead of request body
      const refreshToken = getRefreshTokenFromCookie(req);

      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token not found' });
        return;
      }

      const tokens = await AuthService.refreshAccessToken(refreshToken);

      // Set new refresh token as HttpOnly cookie (token rotation)
      if (tokens.newRefreshToken) {
        setRefreshTokenCookie(res, tokens.newRefreshToken);
      }

      res.json({
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
          // refreshToken removed from response body for security
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'Invalid refresh token' ||
          error.message === 'Invalid or expired refresh token')
      ) {
        // Clear invalid refresh token cookie
        clearRefreshTokenCookie(res);
        res.status(401).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }

  // Logout
  static async logout(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Get refresh token from HttpOnly cookie
      const refreshToken = getRefreshTokenFromCookie(req);

      if (refreshToken) {
        await AuthService.logout(req.user.id, refreshToken);
      }

      // Clear refresh token cookie
      clearRefreshTokenCookie(res);

      res.json({
        message: 'Logout successful',
      });
    } catch (error) {
      // Always clear the cookie even if logout fails
      clearRefreshTokenCookie(res);
      res.status(500).json({ error: 'Logout failed' });
    }
  }
} 