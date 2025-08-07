import { config } from './index';

export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface WebRTCConfig {
  iceServers: IceServerConfig[];
  connectionTimeout: number;
  reconnectAttempts: number;
  reconnectDelay: number;
  maxBitrate: {
    video: number;
    audio: number;
  };
  qualityThresholds: {
    minPacketLossRate: number;
    minJitter: number;
    minRoundTripTime: number;
  };
  sessionDefaults: {
    maxDuration: number; // in minutes
    warningTime: number; // minutes before session ends
    idleTimeout: number; // minutes of inactivity
  };
}

// STUN/TURN server configuration
export const webrtcConfig: WebRTCConfig = {
  iceServers: [
    // Google's public STUN servers
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ]
    },
    // Add TURN servers for production (requires credentials)
    ...(process.env.TURN_SERVER_URL ? [
      {
        urls: process.env.TURN_SERVER_URL,
        username: process.env.TURN_USERNAME || '',
        credential: process.env.TURN_CREDENTIAL || ''
      }
    ] : [])
  ],
  
  // Connection settings
  connectionTimeout: 30000, // 30 seconds
  reconnectAttempts: 3,
  reconnectDelay: 2000, // 2 seconds
  
  // Bitrate limits
  maxBitrate: {
    video: 2500000, // 2.5 Mbps for HD video
    audio: 128000   // 128 kbps for audio
  },
  
  // Quality monitoring thresholds
  qualityThresholds: {
    minPacketLossRate: 0.05, // 5% packet loss threshold
    minJitter: 30,            // 30ms jitter threshold
    minRoundTripTime: 150     // 150ms RTT threshold
  },
  
  // Session management
  sessionDefaults: {
    maxDuration: 120,    // 2 hours max session
    warningTime: 10,     // 10 minutes warning before end
    idleTimeout: 15      // 15 minutes idle timeout
  }
};

// Redis configuration for Socket.io adapter
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    // Exponential backoff retry strategy
    return Math.min(times * 50, 2000);
  }
};

// Socket.io configuration
export const socketConfig = {
  cors: {
    origin: config.isDevelopment ? '*' : process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB
  connectTimeout: 45000,
  allowEIO3: true // Allow different Socket.io versions
};

// Rate limiting for signaling events
export const signalingRateLimits = {
  offer: { points: 5, duration: 60 },        // 5 offers per minute
  answer: { points: 5, duration: 60 },       // 5 answers per minute
  iceCandidate: { points: 50, duration: 60 }, // 50 ICE candidates per minute
  toggleMedia: { points: 10, duration: 60 },  // 10 media toggles per minute
  connectionQuality: { points: 30, duration: 60 } // 30 quality reports per minute
};