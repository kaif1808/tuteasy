import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import {
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
  ConfirmBookingInput,
  GetBookingInput,
  GetBookingsInput
} from '../validation/booking.validation';
import {
  BookingErrorCode,
  BookingValidationError,
  BookingConflictError,
  BookingPermissionError,
  BookingApiResponse
} from '../types/booking.errors';

export class BookingController {
  private bookingService = new BookingService();

  /**
   * POST /api/bookings
   * Create a new booking
   */
  createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { body } = req as CreateBookingInput;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        } as BookingApiResponse);
        return;
      }

      const booking = await this.bookingService.createBooking(userId, body);

      res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully',
        timestamp: new Date().toISOString()
      } as BookingApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * GET /api/bookings/:id
   * Get booking by ID
   */
  getBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { params } = req as unknown as GetBookingInput;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        } as BookingApiResponse);
        return;
      }

      const booking = await this.bookingService.getBookingById(params.id, userId);

      res.json({
        success: true,
        data: booking,
        timestamp: new Date().toISOString()
      } as BookingApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * GET /api/bookings
   * Get bookings with filtering and pagination
   */
  getBookings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req as unknown as GetBookingsInput;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        } as BookingApiResponse);
        return;
      }

      const result = await this.bookingService.getBookings(userId, userRole, query);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      } as BookingApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * PUT /api/bookings/:id
   * Update booking
   */
  updateBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { params, body } = req as UpdateBookingInput;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        } as BookingApiResponse);
        return;
      }

      const booking = await this.bookingService.updateBooking(params.id, userId, body);

      res.json({
        success: true,
        data: booking,
        message: 'Booking updated successfully',
        timestamp: new Date().toISOString()
      } as BookingApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * DELETE /api/bookings/:id
   * Cancel booking
   */
  cancelBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { params, body } = req as CancelBookingInput;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        } as BookingApiResponse);
        return;
      }

      const booking = await this.bookingService.cancelBooking(params.id, userId, body);

      res.json({
        success: true,
        data: booking,
        message: 'Booking cancelled successfully',
        timestamp: new Date().toISOString()
      } as BookingApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * POST /api/bookings/:id/confirm
   * Confirm booking (tutor only)
   */
  confirmBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { params, body } = req as ConfirmBookingInput;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        } as BookingApiResponse);
        return;
      }

      if (userRole !== 'TUTOR') {
        res.status(403).json({
          success: false,
          error: {
            code: BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
            message: 'Only tutors can confirm bookings'
          },
          timestamp: new Date().toISOString()
        } as BookingApiResponse);
        return;
      }

      const booking = await this.bookingService.confirmBooking(params.id, userId, body);

      res.json({
        success: true,
        data: booking,
        message: 'Booking confirmed successfully',
        timestamp: new Date().toISOString()
      } as BookingApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * POST /api/bookings/:id/complete
   * Mark booking as completed
   */
  completeBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const bookingId = req.params.id;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
            message: 'Authentication required'
          },
          timestamp: new Date().toISOString()
        } as BookingApiResponse);
        return;
      }

      const booking = await this.bookingService.completeBooking(bookingId, userId);

      res.json({
        success: true,
        data: booking,
        message: 'Booking marked as completed',
        timestamp: new Date().toISOString()
      } as BookingApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Error handling helper
   */
  private handleError(error: any, res: Response): void {
    console.error('Booking Controller Error:', error);

    if (error instanceof BookingValidationError) {
      res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          field: error.field
        },
        timestamp: new Date().toISOString()
      } as BookingApiResponse);
      return;
    }

    if (error instanceof BookingConflictError) {
      res.status(409).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: {
            conflictingBookingId: error.conflictingBookingId,
            ...error.details
          }
        },
        timestamp: new Date().toISOString()
      } as BookingApiResponse);
      return;
    }

    if (error instanceof BookingPermissionError) {
      res.status(403).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: {
            userId: error.userId,
            resourceId: error.resourceId
          }
        },
        timestamp: new Date().toISOString()
      } as BookingApiResponse);
      return;
    }

    // Generic error handling
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR' as BookingErrorCode,
        message: 'An unexpected error occurred'
      },
      timestamp: new Date().toISOString()
    } as BookingApiResponse);
  }
}
