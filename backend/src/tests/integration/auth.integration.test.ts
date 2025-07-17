import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRoutes from '../../routes/authRoutes';
import { config } from '../../config';

// Create test app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);

// Test database instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/tuteasy_test'
    }
  }
});

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    // Ensure test database is clean
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('User Registration Flow', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        role: 'STUDENT'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.user).toMatchObject({
        email: userData.email,
        role: userData.role,
        isEmailVerified: false
      });
      expect(response.body.accessToken).toBeDefined();

      // Verify refresh token cookie is set
      expect(response.headers['set-cookie']).toBeDefined();
      const refreshTokenCookie = response.headers['set-cookie'].find((cookie: string) => 
        cookie.startsWith('refreshToken=')
      );
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toContain('HttpOnly');

      // Verify user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.firstName).toBe(userData.firstName);
      expect(createdUser?.lastName).toBe(userData.lastName);
    });

    it('should prevent duplicate email registration', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'SecurePass123!',
        role: 'TUTOR'
      };

      // First registration should succeed
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Second registration with same email should fail
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Registration failed. Please check your information and try again.');
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        firstName: 'John',
        email: 'john@example.com'
        // Missing lastName, password, role
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should validate email format', async () => {
      const invalidEmailData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'SecurePass123!',
        role: 'STUDENT'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate password strength', async () => {
      const weakPasswordData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '123',
        role: 'STUDENT'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('User Login Flow', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'SecurePass123!',
          role: 'STUDENT'
        });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.user).toMatchObject({
        email: loginData.email,
        role: 'STUDENT'
      });
      expect(response.body.accessToken).toBeDefined();

      // Verify refresh token cookie is set
      expect(response.headers['set-cookie']).toBeDefined();
      const refreshTokenCookie = response.headers['set-cookie'].find((cookie: string) => 
        cookie.startsWith('refreshToken=')
      );
      expect(refreshTokenCookie).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const invalidLoginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidLoginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password. Please check your credentials and try again.');
    });

    it('should reject non-existent user', async () => {
      const nonExistentUserData = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(nonExistentUserData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password. Please check your credentials and try again.');
    });

    it('should update lastLoginAt on successful login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      const beforeLogin = await prisma.user.findUnique({
        where: { email: loginData.email }
      });

      await request(app)
        .post('/api/auth/login')
        .send(loginData);

      const afterLogin = await prisma.user.findUnique({
        where: { email: loginData.email }
      });

      expect(afterLogin?.lastLoginAt).toBeTruthy();
      expect(afterLogin?.lastLoginAt).not.toEqual(beforeLogin?.lastLoginAt);
    });
  });

  describe('Token Refresh Flow', () => {
    let refreshTokenCookie: string;

    beforeEach(async () => {
      // Register and login to get refresh token
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'SecurePass123!',
          role: 'STUDENT'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      refreshTokenCookie = loginResponse.headers['set-cookie'].find((cookie: string) => 
        cookie.startsWith('refreshToken=')
      );
    });

    it('should refresh tokens with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Cookie', [refreshTokenCookie]);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.accessToken).toBeDefined();

      // Verify new refresh token cookie is set
      expect(response.headers['set-cookie']).toBeDefined();
      const newRefreshTokenCookie = response.headers['set-cookie'].find((cookie: string) => 
        cookie.startsWith('refreshToken=')
      );
      expect(newRefreshTokenCookie).toBeDefined();
      expect(newRefreshTokenCookie).not.toBe(refreshTokenCookie);
    });

    it('should reject request without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Refresh token required');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Cookie', ['refreshToken=invalid-token']);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid refresh token');
    });
  });

  describe('Logout Flow', () => {
    let refreshTokenCookie: string;

    beforeEach(async () => {
      // Register and login to get refresh token
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'SecurePass123!',
          role: 'STUDENT'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      refreshTokenCookie = loginResponse.headers['set-cookie'].find((cookie: string) => 
        cookie.startsWith('refreshToken=')
      );
    });

    it('should logout successfully and clear refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [refreshTokenCookie]);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Logout successful');

      // Verify refresh token cookie is cleared
      expect(response.headers['set-cookie']).toBeDefined();
      const clearedCookie = response.headers['set-cookie'].find((cookie: string) => 
        cookie.startsWith('refreshToken=;')
      );
      expect(clearedCookie).toBeDefined();
    });

    it('should handle logout without refresh token gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Logout successful');
    });

    it('should invalidate refresh token in database', async () => {
      // First, verify refresh token exists
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
      });

      const refreshTokensBefore = await prisma.refreshToken.findMany({
        where: { userId: user?.id }
      });

      expect(refreshTokensBefore.length).toBeGreaterThan(0);

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [refreshTokenCookie]);

      // Verify refresh token is removed
      const refreshTokensAfter = await prisma.refreshToken.findMany({
        where: { userId: user?.id }
      });

      expect(refreshTokensAfter.length).toBe(0);
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should enforce rate limiting on login attempts', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      };

      // Make 5 failed login attempts (the rate limit)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send(loginData);
      }

      // 6th attempt should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many login attempts');
      expect(response.headers['retry-after']).toBeDefined();
    });

    it('should enforce rate limiting on registration attempts', async () => {
      // Make 5 registration attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/register')
          .send({
            firstName: 'Test',
            lastName: 'User',
            email: `test${i}@example.com`,
            password: 'SecurePass123!',
            role: 'STUDENT'
          });
      }

      // 6th attempt should be rate limited
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test6@example.com',
          password: 'SecurePass123!',
          role: 'STUDENT'
        });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many registration attempts');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'security@example.com',
          password: 'SecurePass123!',
          role: 'STUDENT'
        });

      // Check for security headers (these would be set by helmet middleware)
      expect(response.headers['x-content-type-options']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });
});
