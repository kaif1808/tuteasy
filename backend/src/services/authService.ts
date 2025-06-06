import bcrypt from 'bcrypt';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserRole } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { config } from '../config';

interface RegisterData {
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

interface RefreshTokenPayload {
  userId: string;
}

export class AuthService {
  // Generate JWT access token
  static generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const options: SignOptions = {
      expiresIn: parseInt(config.jwt.expiresIn) * 60 * 60,
    };
    return jwt.sign(payload, config.jwt.secret, options);
  }

  // Generate JWT refresh token
  static generateRefreshToken(user: User): string {
    const payload: RefreshTokenPayload = { userId: user.id };
    const options: SignOptions = {
      expiresIn: parseInt(config.jwt.refreshExpiresIn) * 24 * 60 * 60,
    };
    return jwt.sign(payload, config.jwt.refreshSecret, options);
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.security.bcryptSaltRounds);
  }

  // Compare password
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate random token for email verification/password reset
  static generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Register new user
  static async register(data: RegisterData): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password, role = UserRole.TUTOR } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = this.generateRandomToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { user, accessToken, refreshToken };
  }

  // Login user
  static async login(data: LoginData): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error('Account is locked. Please try again later.');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: user.loginAttempts + 1,
          // Lock account after 5 failed attempts for 30 minutes
          lockedUntil: user.loginAttempts >= 4 ? new Date(Date.now() + 30 * 60 * 1000) : null,
        },
      });

      throw new Error('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Reset login attempts and update last login
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(updatedUser);
    const refreshToken = this.generateRefreshToken(updatedUser);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { user: updatedUser, accessToken, refreshToken };
  }

  // Verify email
  static async verifyEmail(token: string): Promise<User> {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return updatedUser;
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      throw new Error('If a user with this email exists, a password reset link has been sent');
    }

    // Generate reset token
    const passwordResetToken = this.generateRandomToken();
    const passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    return updatedUser;
  }

  // Reset password
  static async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return updatedUser;
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; newRefreshToken?: string }> {
    // Verify refresh token
    let payload: RefreshTokenPayload;
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;
      // Ensure userId is present in the decoded payload
      if (!decoded || typeof decoded.userId !== 'string') {
        throw new Error('Invalid refresh token payload: userId missing or not a string');
      }
      payload = { userId: decoded.userId };
    } catch (err) {
      // console.error('Refresh token verification error:', err);
      throw new Error('Invalid or expired refresh token');
    }

    // Check if refresh token exists in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    // If token not found in DB, or if it has an expiry that has passed (though jwt.verify should catch this)
    // For this simple setup, just ensuring it exists is enough after jwt.verify
    if (!storedToken) {
      throw new Error('Refresh token not found in database');
    }
    
    // Additionally, check if the token from DB has expired, as a safeguard
    // This check is somewhat redundant if jwt.verify handles expiry, but good for defense in depth.
    if (storedToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } }); // Clean up expired token
        throw new Error('Refresh token expired (stale DB record)');
    }


    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error('User not found for refresh token');
    }

    // Generate new access token
    const newAccessToken = this.generateAccessToken(user);

    // Optional: Implement refresh token rotation (not implemented here for simplicity)
    // If rotating, generate a new refresh token, save it, potentially revoke the old one in DB,
    // and return the newRefreshToken.

    return { accessToken: newAccessToken };
  }

  // Logout
  static async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Delete specific refresh token
      await prisma.refreshToken.deleteMany({
        where: {
          userId,
          token: refreshToken,
        },
      });
    } else {
      // Delete all refresh tokens for user (logout from all devices)
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }
} 