import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../types/auth';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/verify-email', validate(verifyEmailSchema), AuthController.verifyEmail);
router.post('/request-password-reset', validate(requestPasswordResetSchema), AuthController.requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/refresh-token', validate(refreshTokenSchema), AuthController.refreshToken);

// Protected routes
router.post('/logout', authenticate, validate(logoutSchema), AuthController.logout);

export default router; 