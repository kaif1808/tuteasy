import { Request, Response } from 'express';
import { videoSessionService } from '../services/videoSession.service';
import { prisma } from '../utils/prisma';
import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * Create a new video session for a booking
 */
export const createVideoSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, scheduledStartTime, scheduledEndTime } = req.body;
    const userId = req.user!.id;

    // Verify the user is the tutor for this booking or an admin
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { tutorId: true, studentId: true, status: true }
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.status !== 'CONFIRMED') {
      res.status(400).json({ error: 'Booking must be confirmed to create a video session' });
      return;
    }

    // Check authorization
    if (req.user!.role !== 'ADMIN' && booking.tutorId !== userId) {
      res.status(403).json({ error: 'Not authorized to create session for this booking' });
      return;
    }

    // Create the session
    const session = await videoSessionService.createSession({
      bookingId,
      hostId: booking.tutorId,
      scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : undefined,
      scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : undefined
    });

    res.status(201).json({
      success: true,
      session
    });
  } catch (error: any) {
    console.error('Error creating video session:', error);
    res.status(500).json({ error: error.message || 'Failed to create video session' });
  }
};

/**
 * Get video session details
 */
export const getVideoSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get session details
    const session = await videoSessionService.getSession(id);

    // Check if user is a participant
    const isParticipant = session.participants.some(p => p.userId === userId);
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isParticipant && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to view this session' });
      return;
    }

    res.json({
      success: true,
      session
    });
  } catch (error: any) {
    console.error('Error getting video session:', error);
    if (error.message === 'Video session not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Failed to get video session' });
    }
  }
};

/**
 * Join a video session
 */
export const joinVideoSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { deviceInfo } = req.body;
    const userId = req.user!.id;

    // Join the session
    const session = await videoSessionService.joinSession({
      sessionId: id,
      userId
    });

    // Generate a JWT token for Socket.io authentication
    const socketToken = jwt.sign(
      {
        userId: req.user!.id,
        email: req.user!.email,
        role: req.user!.role,
        sessionId: id
      },
      config.jwt.secret,
      { expiresIn: '4h' } // Session token valid for 4 hours
    );

    // Log device info if provided
    if (deviceInfo) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'VIDEO_SESSION_JOIN',
          entityType: 'VIDEO_SESSION',
          entityId: id,
          ipAddress: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          details: {
            deviceInfo,
            timestamp: new Date().toISOString()
          }
        }
      });
    }

    res.json({
      success: true,
      session,
      socketToken,
      socketUrl: process.env.SOCKET_URL || `ws://localhost:${config.port}`
    });
  } catch (error: any) {
    console.error('Error joining video session:', error);
    if (error.message === 'Session not found' || error.message === 'User is not a participant in this session') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Session is no longer available') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Failed to join video session' });
    }
  }
};

/**
 * End a video session
 */
export const endVideoSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get session to check permissions
    const session = await prisma.videoSession.findUnique({
      where: { id },
      include: {
        booking: {
          select: { tutorId: true }
        }
      }
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Check if user can end the session (host or admin)
    const isHost = session.booking?.tutorId === userId;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isHost && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to end this session' });
      return;
    }

    // End the session
    const endedSession = await videoSessionService.endSession(id);

    res.json({
      success: true,
      session: endedSession
    });
  } catch (error: any) {
    console.error('Error ending video session:', error);
    res.status(500).json({ error: error.message || 'Failed to end video session' });
  }
};

/**
 * Get ICE server configuration
 */
export const getIceServers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get ICE server configuration
    const iceConfig = await videoSessionService.getIceServers(id, userId);

    res.json({
      success: true,
      ...iceConfig
    });
  } catch (error: any) {
    console.error('Error getting ICE servers:', error);
    if (error.message === 'Unauthorized access to session') {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || 'Failed to get ICE servers' });
    }
  }
};

/**
 * Get active sessions for the current user
 */
export const getUserSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get user's active sessions
    const sessions = await videoSessionService.getUserActiveSessions(userId);

    res.json({
      success: true,
      sessions
    });
  } catch (error: any) {
    console.error('Error getting user sessions:', error);
    res.status(500).json({ error: error.message || 'Failed to get user sessions' });
  }
};

/**
 * Get session statistics (Admin only)
 */
export const getSessionStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    // This endpoint would be for admins to monitor video sessions
    if (req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const stats = await prisma.videoSession.aggregate({
      _count: {
        id: true
      },
      where: {
        status: 'IN_PROGRESS'
      }
    });

    const completedToday = await prisma.videoSession.count({
      where: {
        status: 'COMPLETED',
        actualEndTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const averageDuration = await prisma.$queryRaw`
      SELECT AVG(EXTRACT(EPOCH FROM ("actualEndTime" - "actualStartTime"))/60) as avg_duration_minutes
      FROM "VideoSession"
      WHERE "status" = 'COMPLETED'
      AND "actualStartTime" IS NOT NULL
      AND "actualEndTime" IS NOT NULL
      AND "actualEndTime" >= DATE_TRUNC('month', CURRENT_DATE)
    `;

    res.json({
      success: true,
      statistics: {
        activeSessionsCount: stats._count.id,
        completedToday,
        averageDurationMinutes: (averageDuration as any)[0]?.avg_duration_minutes || 0
      }
    });
  } catch (error: any) {
    console.error('Error getting session statistics:', error);
    res.status(500).json({ error: error.message || 'Failed to get session statistics' });
  }
};