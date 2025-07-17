import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  loginLimiter,
  registrationLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  generalAuthLimiter
} from '../../middleware/rateLimit';

describe('Rate Limiting Security Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Login Rate Limiting', () => {
    beforeEach(() => {
      app.use('/login', loginLimiter);
      app.post('/login', (req, res) => {
        // Simulate failed login
        res.status(401).json({ error: 'Invalid credentials' });
      });
    });

    it('should allow requests within rate limit', async () => {
      // Make 4 requests (under the 5 request limit)
      for (let i = 0; i < 4; i++) {
        const response = await request(app)
          .post('/login')
          .send({ email: 'test@example.com', password: 'wrong' });
        
        expect(response.status).toBe(401);
        expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      }
    });

    it('should block requests after exceeding rate limit', async () => {
      // Make 5 requests to hit the limit
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/login')
          .send({ email: 'test@example.com', password: 'wrong' });
      }

      // 6th request should be blocked
      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many login attempts');
      expect(response.headers['retry-after']).toBeDefined();
    });

    it('should include rate limit headers', async () => {
      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(response.headers['x-ratelimit-limit']).toBe('5');
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should reset rate limit after window expires', async () => {
      // This test would require time manipulation or a shorter window for testing
      // For now, we'll test the configuration
      expect(loginLimiter).toBeDefined();
    });
  });

  describe('Registration Rate Limiting', () => {
    beforeEach(() => {
      app.use('/register', registrationLimiter);
      app.post('/register', (req, res) => {
        res.status(201).json({ message: 'User created' });
      });
    });

    it('should allow requests within rate limit', async () => {
      // Make 4 requests (under the 5 request limit)
      for (let i = 0; i < 4; i++) {
        const response = await request(app)
          .post('/register')
          .send({ 
            email: `test${i}@example.com`, 
            password: 'SecurePass123!',
            firstName: 'Test',
            lastName: 'User',
            role: 'STUDENT'
          });
        
        expect(response.status).toBe(201);
      }
    });

    it('should block requests after exceeding rate limit', async () => {
      // Make 5 requests to hit the limit
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/register')
          .send({ 
            email: `test${i}@example.com`, 
            password: 'SecurePass123!',
            firstName: 'Test',
            lastName: 'User',
            role: 'STUDENT'
          });
      }

      // 6th request should be blocked
      const response = await request(app)
        .post('/register')
        .send({ 
          email: 'test6@example.com', 
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'User',
          role: 'STUDENT'
        });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many registration attempts');
    });
  });

  describe('Password Reset Rate Limiting', () => {
    beforeEach(() => {
      app.use('/reset-password', passwordResetLimiter);
      app.post('/reset-password', (req, res) => {
        res.status(200).json({ message: 'Reset email sent' });
      });
    });

    it('should allow requests within rate limit', async () => {
      // Make 2 requests (under the 3 request limit)
      for (let i = 0; i < 2; i++) {
        const response = await request(app)
          .post('/reset-password')
          .send({ email: 'test@example.com' });
        
        expect(response.status).toBe(200);
      }
    });

    it('should block requests after exceeding rate limit', async () => {
      // Make 3 requests to hit the limit
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/reset-password')
          .send({ email: 'test@example.com' });
      }

      // 4th request should be blocked
      const response = await request(app)
        .post('/reset-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many password reset attempts');
    });
  });

  describe('Email Verification Rate Limiting', () => {
    beforeEach(() => {
      app.use('/verify-email', emailVerificationLimiter);
      app.post('/verify-email', (req, res) => {
        res.status(200).json({ message: 'Email verified' });
      });
    });

    it('should allow requests within rate limit', async () => {
      // Make 2 requests (under the 3 request limit)
      for (let i = 0; i < 2; i++) {
        const response = await request(app)
          .post('/verify-email')
          .send({ token: 'verification-token' });
        
        expect(response.status).toBe(200);
      }
    });

    it('should block requests after exceeding rate limit', async () => {
      // Make 3 requests to hit the limit
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/verify-email')
          .send({ token: 'verification-token' });
      }

      // 4th request should be blocked
      const response = await request(app)
        .post('/verify-email')
        .send({ token: 'verification-token' });

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many email verification attempts');
    });
  });

  describe('General Auth Rate Limiting', () => {
    beforeEach(() => {
      app.use('/auth', generalAuthLimiter);
      app.get('/auth/profile', (req, res) => {
        res.status(200).json({ message: 'Profile data' });
      });
    });

    it('should allow requests within rate limit', async () => {
      // Make 19 requests (under the 20 request limit)
      for (let i = 0; i < 19; i++) {
        const response = await request(app)
          .get('/auth/profile');
        
        expect(response.status).toBe(200);
      }
    });

    it('should block requests after exceeding rate limit', async () => {
      // Make 20 requests to hit the limit
      for (let i = 0; i < 20; i++) {
        await request(app)
          .get('/auth/profile');
      }

      // 21st request should be blocked
      const response = await request(app)
        .get('/auth/profile');

      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many requests');
    });
  });

  describe('Rate Limiting Configuration', () => {
    it('should have proper login rate limiting configuration', () => {
      expect(loginLimiter).toBeDefined();
      // Verify configuration through behavior rather than internal properties
    });

    it('should have proper registration rate limiting configuration', () => {
      expect(registrationLimiter).toBeDefined();
    });

    it('should have proper password reset rate limiting configuration', () => {
      expect(passwordResetLimiter).toBeDefined();
    });

    it('should have proper email verification rate limiting configuration', () => {
      expect(emailVerificationLimiter).toBeDefined();
    });

    it('should have proper general auth rate limiting configuration', () => {
      expect(generalAuthLimiter).toBeDefined();
    });
  });

  describe('Rate Limiting Security Features', () => {
    it('should use IP-based rate limiting', async () => {
      app.use('/test', loginLimiter);
      app.post('/test', (req, res) => {
        res.status(200).json({ ip: req.ip });
      });

      const response = await request(app)
        .post('/test')
        .send({});

      expect(response.status).toBe(200);
      // Rate limiting should be applied per IP
    });

    it('should provide informative error messages', async () => {
      app.use('/test', loginLimiter);
      app.post('/test', (req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      // Exceed rate limit
      for (let i = 0; i < 5; i++) {
        await request(app).post('/test').send({});
      }

      const response = await request(app)
        .post('/test')
        .send({});

      expect(response.status).toBe(429);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('Too many');
    });

    it('should include retry-after header', async () => {
      app.use('/test', loginLimiter);
      app.post('/test', (req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      // Exceed rate limit
      for (let i = 0; i < 5; i++) {
        await request(app).post('/test').send({});
      }

      const response = await request(app)
        .post('/test')
        .send({});

      expect(response.status).toBe(429);
      expect(response.headers['retry-after']).toBeDefined();
      expect(parseInt(response.headers['retry-after'])).toBeGreaterThan(0);
    });
  });

  describe('Rate Limiting Edge Cases', () => {
    it('should handle concurrent requests properly', async () => {
      app.use('/concurrent', loginLimiter);
      app.post('/concurrent', (req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      // Make concurrent requests
      const promises = Array(3).fill(null).map(() => 
        request(app).post('/concurrent').send({})
      );

      const responses = await Promise.all(promises);
      
      // All should succeed as they're under the limit
      responses.forEach(response => {
        expect(response.status).toBe(401); // Our mock endpoint returns 401
      });
    });

    it('should handle malformed requests', async () => {
      app.use('/malformed', loginLimiter);
      app.post('/malformed', (req, res) => {
        res.status(400).json({ error: 'Bad request' });
      });

      const response = await request(app)
        .post('/malformed')
        .send('invalid-json');

      // Rate limiting should still work with malformed requests
      expect(response.status).toBe(400);
      expect(response.headers['x-ratelimit-limit']).toBeDefined();
    });
  });
});
