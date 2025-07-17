import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bookingRoutes from '../../routes/booking.routes';
import { authenticate } from '../../middleware/auth';
import { BookingStatus } from '../../types/booking.types';

// Mock Prisma
jest.mock('@prisma/client');
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  tutor: {
    findUnique: jest.fn(),
  },
  booking: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  tutorAvailability: {
    findMany: jest.fn(),
  },
};

// Mock the PrismaClient constructor
(PrismaClient as jest.MockedClass<typeof PrismaClient>).mockImplementation(() => mockPrisma as any);

// Mock authentication middleware
jest.mock('../../middleware/auth');
const mockAuthenticate = authenticate as jest.MockedFunction<typeof authenticate>;

describe('Booking API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware to add user to request
    mockAuthenticate.mockImplementation(async (req: any, _res: any, next: any) => {
      req.user = {
        id: 'student-1',
        email: 'student@test.com',
        role: 'STUDENT',
      };
      next();
    });

    app.use('/api/bookings', bookingRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/bookings', () => {
    const validBookingData = {
      tutorId: 'tutor-1',
      scheduledDate: '2024-12-20',
      startTime: '10:00',
      duration: 60,
      subject: 'Mathematics',
      studentNotes: 'Looking forward to the lesson',
    };

    const mockStudent = {
      id: 'student-1',
      email: 'student@test.com',
      tutor: null,
    };

    const mockTutor = {
      id: 'tutor-1',
      userId: 'tutor-user-1',
      isActive: true,
      verificationStatus: 'VERIFIED',
      hourlyRateMin: 30.00,
      user: { email: 'tutor@test.com' },
    };

    beforeEach(() => {
      mockPrisma.user.findUnique.mockResolvedValue(mockStudent);
      mockPrisma.tutor.findUnique.mockResolvedValue(mockTutor);
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([
        {
          id: 'availability-1',
          tutorId: 'tutor-1',
          dayOfWeek: 5, // Friday
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: true,
          isActive: true,
        },
      ]);
      mockPrisma.booking.findMany.mockResolvedValue([]); // No conflicts
    });

    it('should create booking successfully', async () => {
      const mockCreatedBooking = {
        id: 'booking-1',
        bookingNumber: 'BK001',
        studentId: 'student-1',
        tutorId: 'tutor-1',
        scheduledDate: new Date('2024-12-20'),
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        status: BookingStatus.PENDING,
        hourlyRate: 30.00,
        totalPrice: 30.00,
        currency: 'GBP',
        student: mockStudent,
        tutor: mockTutor,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.booking.create.mockResolvedValue(mockCreatedBooking);

      const response = await request(app)
        .post('/api/bookings')
        .send(validBookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('booking-1');
      expect(response.body.data.status).toBe(BookingStatus.PENDING);
      expect(response.body.message).toBe('Booking created successfully');
    });

    it('should return 400 for invalid booking data', async () => {
      const invalidBookingData = {
        tutorId: 'invalid-uuid',
        scheduledDate: 'invalid-date',
        startTime: '25:00', // Invalid time
        duration: -10, // Invalid duration
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidBookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if tutor not available', async () => {
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/bookings')
        .send(validBookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('TUTOR_NOT_AVAILABLE');
    });

    it('should return 409 for booking conflicts', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([
        {
          id: 'existing-booking',
          startTime: '10:00',
          endTime: '11:00',
          status: BookingStatus.CONFIRMED,
        },
      ]);

      const response = await request(app)
        .post('/api/bookings')
        .send(validBookingData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BOOKING_CONFLICT');
    });
  });

  describe('GET /api/bookings/:id', () => {
    const mockBooking = {
      id: 'booking-1',
      studentId: 'student-1',
      tutorId: 'tutor-1',
      tutor: { userId: 'tutor-user-1', user: { email: 'tutor@test.com' } },
      student: { id: 'student-1', email: 'student@test.com' },
      scheduledDate: new Date('2024-12-20'),
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      status: BookingStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return booking for authorized user', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking);

      const response = await request(app)
        .get('/api/bookings/booking-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('booking-1');
    });

    it('should return 404 for non-existent booking', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/bookings/non-existent')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BOOKING_NOT_FOUND');
    });

    it('should return 403 for unauthorized access', async () => {
      const unauthorizedBooking = {
        ...mockBooking,
        studentId: 'different-student',
        tutor: { userId: 'different-tutor', user: { email: 'other@test.com' } },
      };

      mockPrisma.booking.findUnique.mockResolvedValue(unauthorizedBooking);

      const response = await request(app)
        .get('/api/bookings/booking-1')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED_BOOKING_ACCESS');
    });
  });

  describe('GET /api/bookings', () => {
    it('should return paginated bookings for student', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          studentId: 'student-1',
          tutorId: 'tutor-1',
          status: BookingStatus.PENDING,
          scheduledDate: new Date('2024-12-20'),
          student: { id: 'student-1', email: 'student@test.com' },
          tutor: { userId: 'tutor-user-1', user: { email: 'tutor@test.com' } },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.booking.count.mockResolvedValue(1);
      mockPrisma.booking.findMany.mockResolvedValue(mockBookings);

      const response = await request(app)
        .get('/api/bookings')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toHaveLength(1);
      expect(response.body.data.pagination.total).toBe(1);
    });

    it('should filter bookings by status', async () => {
      mockPrisma.booking.count.mockResolvedValue(0);
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/bookings')
        .query({ status: 'CONFIRMED' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toHaveLength(0);
    });
  });

  describe('PUT /api/bookings/:id', () => {
    const mockBooking = {
      id: 'booking-1',
      studentId: 'student-1',
      tutorId: 'tutor-1',
      status: BookingStatus.PENDING,
      scheduledDate: new Date('2024-12-20'),
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      tutor: { userId: 'tutor-user-1', user: { email: 'tutor@test.com' } },
      student: { id: 'student-1', email: 'student@test.com' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking);
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([
        {
          id: 'availability-1',
          tutorId: 'tutor-1',
          dayOfWeek: 5,
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: true,
          isActive: true,
        },
      ]);
      mockPrisma.booking.findMany.mockResolvedValue([]);
    });

    it('should update booking successfully', async () => {
      const updateData = {
        startTime: '11:00',
        duration: 90,
        studentNotes: 'Updated notes',
      };

      const updatedBooking = {
        ...mockBooking,
        ...updateData,
        endTime: '12:30',
        updatedAt: new Date(),
      };

      mockPrisma.booking.update.mockResolvedValue(updatedBooking);

      const response = await request(app)
        .put('/api/bookings/booking-1')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.startTime).toBe('11:00');
      expect(response.body.data.duration).toBe(90);
      expect(response.body.message).toBe('Booking updated successfully');
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdateData = {
        startTime: '25:00', // Invalid time
        duration: -10, // Invalid duration
      };

      const response = await request(app)
        .put('/api/bookings/booking-1')
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    const mockBooking = {
      id: 'booking-1',
      studentId: 'student-1',
      tutorId: 'tutor-1',
      status: BookingStatus.PENDING,
      tutor: { userId: 'tutor-user-1', user: { email: 'tutor@test.com' } },
      student: { id: 'student-1', email: 'student@test.com' },
      scheduledDate: new Date('2024-12-20'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking);
    });

    it('should cancel booking successfully', async () => {
      const cancelledBooking = {
        ...mockBooking,
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: 'student-1',
        cancellationReason: 'Schedule conflict',
      };

      mockPrisma.booking.update.mockResolvedValue(cancelledBooking);

      const response = await request(app)
        .delete('/api/bookings/booking-1')
        .send({ cancellationReason: 'Schedule conflict' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(BookingStatus.CANCELLED);
      expect(response.body.message).toBe('Booking cancelled successfully');
    });

    it('should return 400 if booking already cancelled', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      const response = await request(app)
        .delete('/api/bookings/booking-1')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BOOKING_ALREADY_CANCELLED');
    });
  });
});
