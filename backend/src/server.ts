import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import tutorProfileRoutes from './routes/tutorProfile.routes';
import studentProfileRoutes from './routes/studentProfile.routes';
import parentProfileRoutes from './routes/parentProfile.routes';
import authRoutes from './routes/authRoutes';
import searchRoutes from './routes/search.routes';
import paymentRoutes from './routes/payment.routes';
import { ZodError } from 'zod';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.isDevelopment ? '*' : process.env.FRONTEND_URL,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter as any);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});
app.use('/api/auth', authLimiter as any);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles/tutor', tutorProfileRoutes);
app.use('/api/profiles/student', studentProfileRoutes);
app.use('/api/profiles/parent', parentProfileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err instanceof ZodError) {
    res.status(400).json({ 
      error: 'Validation error', 
      details: err.errors.map(e => ({ message: e.message, path: e.path })) 
    });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({ error: err.message || 'Internal server error' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${config.env}`);
}); 