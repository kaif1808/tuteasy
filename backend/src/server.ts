import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { config } from './config';
import { socketConfig, redisConfig } from './config/webrtc.config';
import { VideoConferenceNamespace } from './sockets/videoConference.socket';
import tutorProfileRoutes from './routes/tutorProfile.routes';
import studentProfileRoutes from './routes/studentProfile.routes';
import parentProfileRoutes from './routes/parentProfile.routes';
import authRoutes from './routes/authRoutes';
import searchRoutes from './routes/search.routes';
import paymentRoutes from './routes/payment.routes';
import bookingRoutes from './routes/booking.routes';
import availabilityRoutes from './routes/availability.routes';
import videoSessionRoutes from './routes/videoSession.routes';
import { ZodError } from 'zod';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new SocketIOServer(httpServer, socketConfig);

// Setup Redis adapter for Socket.io (for horizontal scaling)
async function setupRedisAdapter() {
  if (process.env.NODE_ENV === 'production' && redisConfig.host) {
    try {
      const pubClient = createClient({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
        db: redisConfig.db
      } as any);
      
      const subClient = pubClient.duplicate();
      
      await Promise.all([
        pubClient.connect(),
        subClient.connect()
      ]);
      
      io.adapter(createAdapter(pubClient, subClient));
      console.log('✅ Redis adapter connected for Socket.io');
    } catch (error) {
      console.error('Failed to setup Redis adapter:', error);
      console.log('⚠️ Running Socket.io without Redis adapter (single instance mode)');
    }
  } else {
    console.log('📝 Running Socket.io in development mode (no Redis adapter)');
  }
}

// Initialize video conferencing namespace
let videoConferenceNamespace: VideoConferenceNamespace;

async function initializeSocketIO() {
  await setupRedisAdapter();
  videoConferenceNamespace = new VideoConferenceNamespace(io);
  console.log('🎥 Video conferencing WebSocket namespace initialized');
}

// Security middleware
app.use(helmet({
  // Allow WebSocket connections
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

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
app.use(cookieParser());

// Health check endpoint
app.get('/health', (_req, res) => {
  const socketStats = videoConferenceNamespace ? 
    videoConferenceNamespace.getConnectionStats() : 
    { activeRooms: 0, totalConnections: 0 };

  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      socketIO: io ? 'active' : 'inactive',
      videoConference: socketStats
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles/tutor', tutorProfileRoutes);
app.use('/api/profiles/student', studentProfileRoutes);
app.use('/api/profiles/parent', parentProfileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/video-sessions', videoSessionRoutes);

// Socket.io connection stats endpoint (for monitoring)
app.get('/api/socket-stats', (_req, res) => {
  if (!videoConferenceNamespace) {
    res.status(503).json({ error: 'Socket.io not initialized' });
    return;
  }

  const stats = videoConferenceNamespace.getConnectionStats();
  res.json(stats);
});

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

async function startServer() {
  try {
    // Initialize Socket.io
    await initializeSocketIO();

    // Start listening
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${config.env}`);
      console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}`);
      console.log(`📹 Video conferencing ready at /video-conference namespace`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing HTTP server and Socket.io connections...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Close all Socket.io connections
  io.close(() => {
    console.log('Socket.io connections closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Closing HTTP server and Socket.io connections...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Close all Socket.io connections
  io.close(() => {
    console.log('Socket.io connections closed');
  });
});

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { app, httpServer, io };