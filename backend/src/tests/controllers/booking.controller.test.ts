import request from 'supertest';
import express from 'express';
import { BookingController } from '../../controllers/booking.controller';
import { BookingService } from '../../services/booking.service';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '@prisma/client';
import { BookingStatus } from '../../types/booking.types';

// Mock dependencies
jest.mock('../../services/booking.service');
jest.mock('../../middleware/auth');

const mockBookingService = BookingService as jest.MockedClass<typeof BookingService>;
const mockAuthenticate = authenticate as jest.MockedFunction<typeof authenticate>;
const mockAuthorize = authorize as jest.MockedFunction<typeof authorize>;

describe('BookingController', () => {
  let app: express.Application;
  let bookingController: BookingController;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    bookingController = new BookingController();

    // Mock authentication middleware
    mockAuthenticate.mockImplementation(async (req, _res, next) => {
      req.user = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.STUDENT
      };
      next();
    });

    // Mock authorization middleware
    mockAuthorize.mockImplementation(() => async (_req, _res, next) => next());

    jest.clearAllMocks();
  });

  describe('POST /bookings', () => {
    beforeEach(() => {
      app.post('/bookings', 
        mockAuthenticate, 
        mockAuthorize('STUDENT', 'PARENT'),
        bookingController.createBooking
      );
    });

    it('should create a new booking successfully', async () => {
      const mockBooking = {
        id: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        parentId: null,
        subject: 'Mathematics',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        duration: 60,
        status: BookingStatus.PENDING,
        totalAmount: 50.00,
        currency: 'GBP',
        notes: 'First lesson',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockBookingService.prototype.createBooking = jest.fn().mockResolvedValue(mockBooking);

      const response = await request(app)
        .post('/bookings')
        .send({
          tutorId: 'tutor-123',
          subject: 'Mathematics',
          startTime: '2024-01-15T10:00:00Z',
          duration: 60,
          notes: 'First lesson'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        status: 'success',
        message: 'Booking created successfully',
        booking: mockBooking
      });
    });

    it('should return 400 for invalid booking data', async () => {
      const response = await request(app)
        .post('/bookings')
        .send({
          tutorId: 'tutor-123',
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 409 for booking conflicts', async () => {
      mockBookingService.prototype.createBooking = jest.fn().mockRejectedValue(
        new Error('Time slot not available')
      );

      const response = await request(app)
        .post('/bookings')
        .send({
          tutorId: 'tutor-123',
          subject: 'Mathematics',
          startTime: '2024-01-15T10:00:00Z',
          duration: 60
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should handle service errors gracefully', async () => {
      mockBookingService.prototype.createBooking = jest.fn().mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .post('/bookings')
        .send({
          tutorId: 'tutor-123',
          subject: 'Mathematics',
          startTime: '2024-01-15T10:00:00Z',
          duration: 60
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('GET /bookings/:id', () => {
    beforeEach(() => {
      app.get('/bookings/:id', 
        mockAuthenticate,
        bookingController.getBooking
      );
    });

    it('should retrieve booking successfully', async () => {
      const mockBooking = {
        id: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        subject: 'Mathematics',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        status: BookingStatus.CONFIRMED,
        totalAmount: 50.00,
        currency: 'GBP'
      };

      mockBookingService.prototype.getBookingById = jest.fn().mockResolvedValue(mockBooking);

      const response = await request(app)
        .get('/bookings/booking-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        booking: mockBooking
      });
    });

    it('should return 404 for non-existent booking', async () => {
      mockBookingService.prototype.getBookingById = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/bookings/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Booking not found');
    });

    it('should return 403 for unauthorized access', async () => {
      mockBookingService.prototype.getBookingById = jest.fn().mockRejectedValue(
        new Error('Access denied')
      );

      const response = await request(app)
        .get('/bookings/booking-123');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('GET /bookings', () => {
    beforeEach(() => {
      app.get('/bookings', 
        mockAuthenticate,
        bookingController.getBookings
      );
    });

    it('should retrieve user bookings successfully', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          tutorId: 'tutor-123',
          studentId: 'student-123',
          subject: 'Mathematics',
          startTime: new Date('2024-01-15T10:00:00Z'),
          status: BookingStatus.CONFIRMED
        },
        {
          id: 'booking-2',
          tutorId: 'tutor-456',
          studentId: 'student-123',
          subject: 'Physics',
          startTime: new Date('2024-01-16T14:00:00Z'),
          status: BookingStatus.PENDING
        }
      ];

      const mockPagination = {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      mockBookingService.prototype.getBookings = jest.fn().mockResolvedValue({
        bookings: mockBookings,
        pagination: mockPagination
      });

      const response = await request(app)
        .get('/bookings')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        bookings: mockBookings,
        pagination: mockPagination
      });
    });

    it('should handle pagination parameters', async () => {
      mockBookingService.prototype.getBookings = jest.fn().mockResolvedValue({
        bookings: [],
        pagination: { total: 0, page: 1, limit: 5, totalPages: 0 }
      });

      const response = await request(app)
        .get('/bookings')
        .query({ page: 1, limit: 5, status: 'CONFIRMED' });

      expect(response.status).toBe(200);
      expect(mockBookingService.prototype.getBookings).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          page: 1,
          limit: 5,
          status: 'CONFIRMED'
        })
      );
    });
  });

  describe('PUT /bookings/:id', () => {
    beforeEach(() => {
      app.put('/bookings/:id', 
        mockAuthenticate,
        bookingController.updateBooking
      );
    });

    it('should update booking successfully', async () => {
      const mockUpdatedBooking = {
        id: 'booking-123',
        tutorId: 'tutor-123',
        studentId: 'student-123',
        subject: 'Mathematics',
        startTime: new Date('2024-01-15T11:00:00Z'), // Updated time
        endTime: new Date('2024-01-15T12:00:00Z'),
        status: BookingStatus.CONFIRMED,
        notes: 'Updated notes'
      };

      mockBookingService.prototype.updateBooking = jest.fn().mockResolvedValue(mockUpdatedBooking);

      const response = await request(app)
        .put('/bookings/booking-123')
        .send({
          startTime: '2024-01-15T11:00:00Z',
          notes: 'Updated notes'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'Booking updated successfully',
        booking: mockUpdatedBooking
      });
    });

    it('should return 404 for non-existent booking', async () => {
      mockBookingService.prototype.updateBooking = jest.fn().mockRejectedValue(
        new Error('Booking not found')
      );

      const response = await request(app)
        .put('/bookings/non-existent')
        .send({
          notes: 'Updated notes'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('POST /bookings/:id/confirm', () => {
    beforeEach(() => {
      app.post('/bookings/:id/confirm', 
        mockAuthenticate,
        mockAuthorize('TUTOR'),
        bookingController.confirmBooking
      );
    });

    it('should confirm booking successfully', async () => {
      const mockConfirmedBooking = {
        id: 'booking-123',
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date()
      };

      mockBookingService.prototype.confirmBooking = jest.fn().mockResolvedValue(mockConfirmedBooking);

      const response = await request(app)
        .post('/bookings/booking-123/confirm');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'Booking confirmed successfully',
        booking: mockConfirmedBooking
      });
    });

    it('should return 404 for non-existent booking', async () => {
      mockBookingService.prototype.confirmBooking = jest.fn().mockRejectedValue(
        new Error('Booking not found')
      );

      const response = await request(app)
        .post('/bookings/non-existent/confirm');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('POST /bookings/:id/cancel', () => {
    beforeEach(() => {
      app.post('/bookings/:id/cancel', 
        mockAuthenticate,
        bookingController.cancelBooking
      );
    });

    it('should cancel booking successfully', async () => {
      const mockCancelledBooking = {
        id: 'booking-123',
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: 'Student unavailable'
      };

      mockBookingService.prototype.cancelBooking = jest.fn().mockResolvedValue(mockCancelledBooking);

      const response = await request(app)
        .post('/bookings/booking-123/cancel')
        .send({
          reason: 'Student unavailable'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        message: 'Booking cancelled successfully',
        booking: mockCancelledBooking
      });
    });

    it('should handle cancellation with refund calculation', async () => {
      const mockCancelledBooking = {
        id: 'booking-123',
        status: BookingStatus.CANCELLED,
        refundAmount: 25.00,
        refundReason: 'Cancellation within policy'
      };

      mockBookingService.prototype.cancelBooking = jest.fn().mockResolvedValue(mockCancelledBooking);

      const response = await request(app)
        .post('/bookings/booking-123/cancel')
        .send({
          reason: 'Emergency'
        });

      expect(response.status).toBe(200);
      expect(response.body.booking.refundAmount).toBe(25.00);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      // Reset mock to simulate unauthenticated request
      mockAuthenticate.mockImplementation(async (_req, res, _next) => {
        res.status(401).json({ error: 'Authentication required' });
      });

      const response = await request(app)
        .get('/bookings');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should enforce role-based authorization', async () => {
      // Reset mock to simulate unauthorized request
      mockAuthorize.mockImplementation(() => async (_req, res, _next) => {
        res.status(403).json({ error: 'Insufficient permissions' });
      });

      app.post('/test-auth',
        mockAuthenticate,
        mockAuthorize('ADMIN'),
        (_req, res) => res.json({ success: true })
      );

      const response = await request(app)
        .post('/test-auth');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });
  });
});
