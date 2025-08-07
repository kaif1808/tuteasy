import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import {
  createVideoSession,
  getVideoSession,
  joinVideoSession,
  endVideoSession,
  getIceServers,
  getUserSessions
} from '../controllers/videoSession.controller';

const router = Router();

// Validation schemas
const createSessionSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid('Invalid booking ID'),
    scheduledStartTime: z.string().datetime().optional(),
    scheduledEndTime: z.string().datetime().optional()
  })
});

const sessionIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid session ID')
  })
});

const joinSessionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid session ID')
  }),
  body: z.object({
    deviceInfo: z.object({
      browser: z.string().optional(),
      os: z.string().optional(),
      deviceType: z.string().optional()
    }).optional()
  })
});

// Routes

/**
 * @route   POST /api/video-sessions/create
 * @desc    Create a new video session for a booking
 * @access  Private (Tutor/Admin)
 */
router.post(
  '/create',
  authenticate,
  authorize('TUTOR', 'ADMIN'),
  validate(createSessionSchema),
  createVideoSession
);

/**
 * @route   GET /api/video-sessions/:id
 * @desc    Get video session details
 * @access  Private (Participants only)
 */
router.get(
  '/:id',
  authenticate,
  validate(sessionIdSchema),
  getVideoSession
);

/**
 * @route   POST /api/video-sessions/:id/join
 * @desc    Join a video session and get connection token
 * @access  Private (Participants only)
 */
router.post(
  '/:id/join',
  authenticate,
  validate(joinSessionSchema),
  joinVideoSession
);

/**
 * @route   POST /api/video-sessions/:id/end
 * @desc    End a video session
 * @access  Private (Host/Admin only)
 */
router.post(
  '/:id/end',
  authenticate,
  validate(sessionIdSchema),
  endVideoSession
);

/**
 * @route   GET /api/video-sessions/:id/ice-servers
 * @desc    Get ICE server configuration for WebRTC
 * @access  Private (Participants only)
 */
router.get(
  '/:id/ice-servers',
  authenticate,
  validate(sessionIdSchema),
  getIceServers
);

/**
 * @route   GET /api/video-sessions/user/active
 * @desc    Get active sessions for the current user
 * @access  Private
 */
router.get(
  '/user/active',
  authenticate,
  getUserSessions
);

export default router;