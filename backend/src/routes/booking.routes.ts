import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
  confirmBookingSchema,
  getBookingSchema,
  getBookingsSchema
} from '../validation/booking.validation';

const router = Router();
const bookingController = new BookingController();

// All booking routes require authentication
router.use(authenticate);

/**
 * POST /api/bookings
 * Create a new booking
 * Accessible by: STUDENT, PARENT
 */
router.post(
  '/',
  authorize('STUDENT', 'PARENT'),
  validate(createBookingSchema),
  bookingController.createBooking
);

/**
 * GET /api/bookings
 * Get bookings with filtering and pagination
 * Accessible by: All authenticated users (filtered by role)
 */
router.get(
  '/',
  validate(getBookingsSchema),
  bookingController.getBookings
);

/**
 * GET /api/bookings/:id
 * Get booking by ID
 * Accessible by: Booking participants (student/tutor)
 */
router.get(
  '/:id',
  validate(getBookingSchema),
  bookingController.getBooking
);

/**
 * PUT /api/bookings/:id
 * Update booking
 * Accessible by: Booking participants (student/tutor)
 */
router.put(
  '/:id',
  validate(updateBookingSchema),
  bookingController.updateBooking
);

/**
 * DELETE /api/bookings/:id
 * Cancel booking
 * Accessible by: Booking participants (student/tutor)
 */
router.delete(
  '/:id',
  validate(cancelBookingSchema),
  bookingController.cancelBooking
);

/**
 * POST /api/bookings/:id/confirm
 * Confirm booking (tutor only)
 * Accessible by: TUTOR
 */
router.post(
  '/:id/confirm',
  authorize('TUTOR'),
  validate(confirmBookingSchema),
  bookingController.confirmBooking
);

/**
 * POST /api/bookings/:id/complete
 * Mark booking as completed
 * Accessible by: Booking participants (student/tutor)
 */
router.post(
  '/:id/complete',
  bookingController.completeBooking
);

export default router;
