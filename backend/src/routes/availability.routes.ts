import { Router } from 'express';
import { AvailabilityController } from '../controllers/availability.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createAvailabilitySchema,
  updateAvailabilitySchema,
  deleteAvailabilitySchema,
  getAvailabilitySchema,
  getAvailableDatesSchema,
  getAvailableTimeSlotsSchema
} from '../validation/booking.validation';

const router = Router();
const availabilityController = new AvailabilityController();

// All availability routes require authentication
router.use(authenticate);

/**
 * POST /api/availability
 * Create availability slot
 * Accessible by: TUTOR
 */
router.post(
  '/',
  authorize('TUTOR'),
  validate(createAvailabilitySchema),
  availabilityController.createAvailability
);

/**
 * PUT /api/availability/:id
 * Update availability slot
 * Accessible by: TUTOR (own slots only)
 */
router.put(
  '/:id',
  authorize('TUTOR'),
  validate(updateAvailabilitySchema),
  availabilityController.updateAvailability
);

/**
 * DELETE /api/availability/:id
 * Delete availability slot
 * Accessible by: TUTOR (own slots only)
 */
router.delete(
  '/:id',
  authorize('TUTOR'),
  validate(deleteAvailabilitySchema),
  availabilityController.deleteAvailability
);

/**
 * GET /api/tutors/:tutorId/availability
 * Get tutor's availability slots
 * Accessible by: All authenticated users
 */
router.get(
  '/tutors/:tutorId',
  validate(getAvailabilitySchema),
  availabilityController.getTutorAvailability
);

/**
 * GET /api/tutors/:tutorId/availability/dates
 * Get available dates for a tutor
 * Accessible by: All authenticated users
 */
router.get(
  '/tutors/:tutorId/dates',
  validate(getAvailableDatesSchema),
  availabilityController.getAvailableDates
);

/**
 * GET /api/tutors/:tutorId/availability/slots
 * Get available time slots for a specific date
 * Accessible by: All authenticated users
 */
router.get(
  '/tutors/:tutorId/slots',
  validate(getAvailableTimeSlotsSchema),
  availabilityController.getAvailableTimeSlots
);

export default router;
