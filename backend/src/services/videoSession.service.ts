import { prisma } from '../utils/prisma';
import { v4 as uuidv4 } from 'uuid';
import { VideoSessionStatus, SessionParticipantStatus, UserRole } from '@prisma/client';
import { webrtcConfig } from '../config/webrtc.config';

export interface CreateVideoSessionParams {
  bookingId: string;
  hostId: string;
  scheduledStartTime?: Date;
  scheduledEndTime?: Date;
}

export interface JoinSessionParams {
  sessionId: string;
  userId: string;
}

export interface UpdateSessionStatusParams {
  sessionId: string;
  status: VideoSessionStatus;
  endedAt?: Date;
}

export interface SessionParticipantUpdate {
  sessionId: string;
  userId: string;
  status?: SessionParticipantStatus;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
  connectionQuality?: any;
}

export class VideoSessionService {
  /**
   * Create a new video session for a booking
   */
  async createSession(params: CreateVideoSessionParams) {
    const { bookingId, hostId, scheduledStartTime, scheduledEndTime } = params;

    // Verify booking exists and is confirmed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tutor: true,
        student: true
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new Error('Booking must be confirmed to create a video session');
    }

    // Check if session already exists for this booking
    const existingSession = await prisma.videoSession.findUnique({
      where: { bookingId }
    });

    if (existingSession) {
      throw new Error('Video session already exists for this booking');
    }

    // Generate unique room ID
    const roomId = this.generateRoomId();

    // Create video session
    const session = await prisma.videoSession.create({
      data: {
        roomId,
        bookingId,
        status: 'SCHEDULED',
        startTime: scheduledStartTime || booking.startTime,
        endTime: scheduledEndTime || booking.endTime,
        maxParticipants: 2, // Tutor and student
        isRecordingEnabled: false, // Can be configured based on requirements
        participants: {
          create: [
            {
              userId: booking.tutorId,
              role: 'HOST',
              status: 'INVITED',
              joinedAt: null
            },
            {
              userId: booking.studentId,
              role: 'PARTICIPANT',
              status: 'INVITED',
              joinedAt: null
            }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        },
        booking: true
      }
    });

    return session;
  }

  /**
   * Get session details by ID
   */
  async getSession(sessionId: string) {
    const session = await prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        },
        booking: {
          include: {
            tutor: {
              select: {
                id: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            },
            student: {
              select: {
                id: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            },
            subject: true
          }
        },
        recording: true
      }
    });

    if (!session) {
      throw new Error('Video session not found');
    }

    return session;
  }

  /**
   * Join a video session
   */
  async joinSession(params: JoinSessionParams) {
    const { sessionId, userId } = params;

    // Verify session exists and is joinable
    const session = await prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: true
      }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === 'COMPLETED' || session.status === 'CANCELLED') {
      throw new Error('Session is no longer available');
    }

    // Check if user is a participant
    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) {
      throw new Error('User is not a participant in this session');
    }

    // Update participant status
    await prisma.sessionParticipant.update({
      where: { id: participant.id },
      data: {
        status: 'CONNECTED',
        joinedAt: new Date()
      }
    });

    // If first participant to join, update session status to IN_PROGRESS
    const activeParticipants = await prisma.sessionParticipant.count({
      where: {
        sessionId,
        status: 'CONNECTED'
      }
    });

    if (activeParticipants === 1 && session.status === 'SCHEDULED') {
      await prisma.videoSession.update({
        where: { id: sessionId },
        data: {
          status: 'IN_PROGRESS',
          actualStartTime: new Date()
        }
      });
    }

    // Return session with updated info
    return this.getSession(sessionId);
  }

  /**
   * Leave a video session
   */
  async leaveSession(sessionId: string, userId: string) {
    // Update participant status
    const participant = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId,
        userId
      }
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    await prisma.sessionParticipant.update({
      where: { id: participant.id },
      data: {
        status: 'DISCONNECTED',
        leftAt: new Date()
      }
    });

    // Check if all participants have left
    const activeParticipants = await prisma.sessionParticipant.count({
      where: {
        sessionId,
        status: 'CONNECTED'
      }
    });

    // If no active participants, consider ending the session
    if (activeParticipants === 0) {
      const session = await prisma.videoSession.findUnique({
        where: { id: sessionId }
      });

      if (session && session.status === 'IN_PROGRESS') {
        // Give a grace period before ending (in case of reconnection)
        setTimeout(async () => {
          const recheckActive = await prisma.sessionParticipant.count({
            where: {
              sessionId,
              status: 'CONNECTED'
            }
          });

          if (recheckActive === 0) {
            await this.endSession(sessionId);
          }
        }, 30000); // 30 seconds grace period
      }
    }
  }

  /**
   * End a video session
   */
  async endSession(sessionId: string) {
    const session = await prisma.videoSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === 'COMPLETED' || session.status === 'CANCELLED') {
      return session; // Already ended
    }

    // Update session status
    const updatedSession = await prisma.videoSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        actualEndTime: new Date()
      }
    });

    // Update all connected participants to disconnected
    await prisma.sessionParticipant.updateMany({
      where: {
        sessionId,
        status: 'CONNECTED'
      },
      data: {
        status: 'DISCONNECTED',
        leftAt: new Date()
      }
    });

    // Update booking status if needed
    if (session.bookingId) {
      await prisma.booking.update({
        where: { id: session.bookingId },
        data: { status: 'COMPLETED' }
      });
    }

    return updatedSession;
  }

  /**
   * Update participant status and media state
   */
  async updateParticipant(params: SessionParticipantUpdate) {
    const { sessionId, userId, ...updates } = params;

    const participant = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId,
        userId
      }
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    const updatedParticipant = await prisma.sessionParticipant.update({
      where: { id: participant.id },
      data: updates
    });

    return updatedParticipant;
  }

  /**
   * Get ICE server configuration
   */
  async getIceServers(sessionId: string, userId: string) {
    // Verify user has access to this session
    const participant = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId,
        userId
      }
    });

    if (!participant) {
      throw new Error('Unauthorized access to session');
    }

    // Return ICE server configuration
    // In production, you might generate temporary TURN credentials here
    return {
      iceServers: webrtcConfig.iceServers,
      maxBitrate: webrtcConfig.maxBitrate,
      connectionTimeout: webrtcConfig.connectionTimeout
    };
  }

  /**
   * Check if session is about to expire
   */
  async checkSessionExpiry(sessionId: string): Promise<{
    isExpiring: boolean;
    minutesRemaining: number;
  }> {
    const session = await prisma.videoSession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.status !== 'IN_PROGRESS') {
      return { isExpiring: false, minutesRemaining: -1 };
    }

    const now = new Date();
    const endTime = session.endTime;
    const minutesRemaining = Math.floor((endTime.getTime() - now.getTime()) / 60000);

    return {
      isExpiring: minutesRemaining <= webrtcConfig.sessionDefaults.warningTime,
      minutesRemaining: Math.max(0, minutesRemaining)
    };
  }

  /**
   * Handle idle timeout
   */
  async handleIdleTimeout(sessionId: string) {
    const session = await prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: true
      }
    });

    if (!session || session.status !== 'IN_PROGRESS') {
      return;
    }

    // Check last activity time for all participants
    const now = new Date();
    const idleThreshold = new Date(now.getTime() - webrtcConfig.sessionDefaults.idleTimeout * 60000);

    const activeRecently = session.participants.some(p => 
      p.status === 'CONNECTED' && 
      p.joinedAt && 
      p.joinedAt > idleThreshold
    );

    if (!activeRecently) {
      // End session due to inactivity
      await this.endSession(sessionId);
    }
  }

  /**
   * Generate a unique room ID
   */
  private generateRoomId(): string {
    // Generate a readable room ID
    const timestamp = Date.now().toString(36);
    const randomStr = uuidv4().split('-')[0];
    return `room-${timestamp}-${randomStr}`;
  }

  /**
   * Validate user permission to access session
   */
  async validateUserAccess(sessionId: string, userId: string): Promise<boolean> {
    const participant = await prisma.sessionParticipant.findFirst({
      where: {
        sessionId,
        userId
      }
    });

    return !!participant;
  }

  /**
   * Get active sessions for a user
   */
  async getUserActiveSessions(userId: string) {
    const sessions = await prisma.videoSession.findMany({
      where: {
        participants: {
          some: {
            userId
          }
        },
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS']
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        booking: {
          include: {
            subject: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return sessions;
  }
}

export const videoSessionService = new VideoSessionService();