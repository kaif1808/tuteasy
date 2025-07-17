import { Request, Response } from 'express';
import { AvailabilityService } from '../services/availability.service';
import {
  CreateAvailabilityInput,
  UpdateAvailabilityInput,
  DeleteAvailabilityInput,
  GetAvailabilityInput,
  GetAvailableDatesInput,
  GetAvailableTimeSlotsInput
} from '../validation/booking.validation';
import {
  BookingErrorCode,
  BookingValidationError,
  BookingPermissionError,
  BookingApiResponse
} from '../types/booking.errors';

export class AvailabilityController {
  private availabilityService = new AvailabilityService();

  /**
   * POST /api/availability
   * Create availability slot (tutor only)
   */
  createAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { body } = req as CreateAvailabilityInput;
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
            message: 'Only tutors can create availability slots'
          },
          timestamp: new Date().toISOString()
        } as BookingApiResponse);
        return;
      }

      const availability = await this.availabilityService.createAvailability(userId, body);

      res.status(201).json({
        success: true,
        data: availability,
        message: 'Availability slot created successfully',
        timestamp: new Date().toISOString()
      } as BookingApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * PUT /api/availability/:id
   * Update availability slot (tutor only)
   */
  updateAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { params, body } = req as UpdateAvailabilityInput;
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
            message: 'Only tutors can update availability slots'
          },
          timestamp: new Date().toISOString()
        } as BookingApiResponse);
        return;
      }

      const availability = await this.availabilityService.updateAvailability(
        params.id,
        userId,
        body
      );

      res.json({
        success: true,
        data: availability,
        message: 'Availability slot updated successfully',
        timestamp: new Date().toISOString()
      } as BookingApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * DELETE /api/availability/:id
   * Delete availability slot (tutor only)
   */
  deleteAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { params } = req as DeleteAvailabilityInput;
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
            message: 'Only tutors can delete availability slots'
          },
          timestamp: new Date().toISOString()
        } as BookingApiResponse);
        return;
      }

      await this.availabilityService.deleteAvailability(params.id, userId);

      res.json({
        success: true,
        data: null,
        message: 'Availability slot deleted successfully',
        timestamp: new Date().toISOString()
      } as BookingApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * GET /api/tutors/:tutorId/availability
   * Get tutor's availability slots
   */
  getTutorAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { params } = req as GetAvailabilityInput;
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

      const availability = await this.availabilityService.getTutorAvailability(params.tutorId);

      res.json({
        success: true,
        data: availability,
        timestamp: new Date().toISOString()
      } as BookingApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * GET /api/tutors/:tutorId/availability/dates
   * Get available dates for a tutor
   */
  getAvailableDates = async (req: Request, res: Response): Promise<void> => {
    try {
      const { params, query } = req as GetAvailableDatesInput;
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

      const availableDates = await this.availabilityService.getAvailableDates(
        params.tutorId,
        query
      );

      res.json({
        success: true,
        data: availableDates,
        timestamp: new Date().toISOString()
      } as BookingApiResponse);

    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * GET /api/tutors/:tutorId/availability/slots
   * Get available time slots for a specific date
   */
  getAvailableTimeSlots = async (req: Request, res: Response): Promise<void> => {
    try {
      const { params, query } = req as GetAvailableTimeSlotsInput;
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

      const timeSlots = await this.availabilityService.getAvailableTimeSlots(
        params.tutorId,
        query.date
      );

      res.json({
        success: true,
        data: timeSlots,
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
    console.error('Availability Controller Error:', error);

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
