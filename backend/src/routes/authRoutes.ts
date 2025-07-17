import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  loginRateLimiter,
  passwordResetRateLimiter,
  registrationRateLimiter,
  authApiRateLimiter,
  emailVerificationRateLimiter,
} from '../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from '../types/auth';

const router = Router();

// Public routes with rate limiting
router.post('/register', registrationRateLimiter, validate(registerSchema), AuthController.register);
router.post('/login', loginRateLimiter, validate(loginSchema), AuthController.login);
router.get('/verify-email', emailVerificationRateLimiter, validate(verifyEmailSchema), AuthController.verifyEmail);
router.post('/request-password-reset', passwordResetRateLimiter, validate(requestPasswordResetSchema), AuthController.requestPasswordReset);
router.post('/reset-password', authApiRateLimiter, validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/refresh-token', authApiRateLimiter, AuthController.refreshToken);

// Protected routes
router.post('/logout', authApiRateLimiter, authenticate, AuthController.logout);

export default router; 