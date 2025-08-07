import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../utils/prisma';
import { UserRole } from '@prisma/client';

interface SocketUser {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
  sessionId?: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Middleware to authenticate Socket.io connections
 * Validates JWT token and attaches user information to socket
 */
export const authenticateSocket = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    // Extract token from auth header or query params
    const token = socket.handshake.auth?.token || 
                  socket.handshake.headers?.authorization?.split(' ')[1] ||
                  socket.handshake.query?.token as string;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        role: true,
        isActive: true 
      },
    });

    if (!user) {
      return next(new Error('User not found'));
    }

    if (!user.isActive) {
      return next(new Error('User account is inactive'));
    }

    // Attach user to socket
    socket.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // If sessionId is provided, validate it
    const sessionId = socket.handshake.auth?.sessionId || 
                     socket.handshake.query?.sessionId as string;
    
    if (sessionId) {
      // Validate session exists and user is a participant
      const session = await prisma.videoSession.findFirst({
        where: {
          id: sessionId,
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          participants: {
            some: {
              userId: user.id
            }
          }
        }
      });

      if (!session) {
        return next(new Error('Invalid or expired session'));
      }

      socket.sessionId = sessionId;
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new Error('Token expired'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new Error('Invalid token'));
    }
    console.error('Socket authentication error:', error);
    return next(new Error('Authentication error'));
  }
};

/**
 * Middleware to authorize Socket.io connections based on user role
 * @param roles - Array of allowed user roles
 */
export const authorizeSocket = (...roles: UserRole[]) => {
  return (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    if (!socket.user) {
      return next(new Error('Authentication required'));
    }

    if (!roles.includes(socket.user.role)) {
      return next(new Error('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Validate session participant
 * Ensures the user is a valid participant of the video session
 */
export const validateSessionParticipant = async (
  socket: AuthenticatedSocket, 
  sessionId: string
): Promise<boolean> => {
  if (!socket.user) {
    return false;
  }

  try {
    const participant = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId,
        userId: socket.user.id
      },
      include: {
        session: {
          select: {
            status: true,
            startTime: true,
            endTime: true
          }
        }
      }
    });

    if (!participant) {
      return false;
    }

    // Check if session is active or about to start (5 minutes buffer)
    const now = new Date();
    const session = participant.session;
    const startBuffer = new Date(session.startTime.getTime() - 5 * 60 * 1000); // 5 minutes before start

    if (session.status === 'CANCELLED' || session.status === 'COMPLETED') {
      return false;
    }

    if (session.status === 'SCHEDULED' && now < startBuffer) {
      return false; // Too early to join
    }

    if (session.endTime && now > session.endTime) {
      return false; // Session has ended
    }

    return true;
  } catch (error) {
    console.error('Error validating session participant:', error);
    return false;
  }
};

/**
 * Check if user can perform moderation actions
 * Tutors and admins can moderate sessions
 */
export const canModerateSession = async (
  socket: AuthenticatedSocket,
  sessionId: string
): Promise<boolean> => {
  if (!socket.user) {
    return false;
  }

  // Admins can moderate any session
  if (socket.user.role === 'ADMIN') {
    return true;
  }

  // Check if user is the tutor for this session
  if (socket.user.role === 'TUTOR') {
    const session = await prisma.videoSession.findFirst({
      where: {
        id: sessionId,
        booking: {
          tutorId: socket.user.id
        }
      }
    });
    
    return !!session;
  }

  return false;
};

/**
 * Log socket connection for audit purposes
 */
export const logSocketConnection = async (
  socket: AuthenticatedSocket,
  event: 'connect' | 'disconnect',
  details?: Record<string, any>
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: socket.user?.id || 'anonymous',
        action: `SOCKET_${event.toUpperCase()}`,
        entityType: 'VIDEO_SESSION',
        entityId: socket.sessionId || 'unknown',
        ipAddress: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent'] || 'unknown',
        details: {
          socketId: socket.id,
          timestamp: new Date().toISOString(),
          ...details
        }
      }
    });
  } catch (error) {
    console.error('Failed to log socket connection:', error);
  }
};

export type { AuthenticatedSocket, SocketUser };