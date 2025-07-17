import { BookingService } from '../../services/booking.service';
import { PrismaClient } from '@prisma/client';
import { BookingStatus } from '../../types/booking.types';
import {
  BookingValidationError,
  BookingConflictError,
  BookingPermissionError
} from '../../types/booking.errors';

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

describe('BookingService', () => {
  let bookingService: BookingService;

  beforeEach(() => {
    bookingService = new BookingService(mockPrisma as any);
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
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

    const mockBookingData = {
      tutorId: 'tutor-1',
      scheduledDate: '2024-12-20',
      startTime: '10:00',
      duration: 60,
      subject: 'Mathematics',
      studentNotes: 'Looking forward to the lesson',
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

    it('should create a booking successfully', async () => {
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
        confirmationCode: 'ABC12345',
        student: mockStudent,
        tutor: mockTutor,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.booking.create.mockResolvedValue(mockCreatedBooking);

      const result = await bookingService.createBooking('student-1', mockBookingData);

      expect(result).toBeDefined();
      expect(result.id).toBe('booking-1');
      expect(result.status).toBe(BookingStatus.PENDING);
      expect(result.totalPrice).toBe(30.00);
      expect(mockPrisma.booking.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          studentId: 'student-1',
          tutorId: 'tutor-1',
          scheduledDate: new Date('2024-12-20'),
          startTime: '10:00',
          endTime: '11:00',
          duration: 60,
          status: BookingStatus.PENDING,
          hourlyRate: 30.00,
          totalPrice: 30.00,
        }),
        include: expect.any(Object),
      });
    });

    it('should throw error if student not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        bookingService.createBooking('invalid-student', mockBookingData)
      ).rejects.toThrow(BookingValidationError);
    });

    it('should throw error if tutor not found', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue(null);

      await expect(
        bookingService.createBooking('student-1', mockBookingData)
      ).rejects.toThrow(BookingValidationError);
    });

    it('should throw error if tutor is inactive', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue({
        ...mockTutor,
        isActive: false,
      });

      await expect(
        bookingService.createBooking('student-1', mockBookingData)
      ).rejects.toThrow(BookingValidationError);
    });

    it('should throw error if tutor is not verified', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue({
        ...mockTutor,
        verificationStatus: 'PENDING',
      });

      await expect(
        bookingService.createBooking('student-1', mockBookingData)
      ).rejects.toThrow(BookingValidationError);
    });

    it('should throw error if student tries to book themselves', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockStudent,
        tutor: { id: 'tutor-1' },
      });

      await expect(
        bookingService.createBooking('student-1', mockBookingData)
      ).rejects.toThrow(BookingValidationError);
    });

    it('should throw error for past date booking', async () => {
      const pastBookingData = {
        ...mockBookingData,
        scheduledDate: '2020-01-01',
      };

      await expect(
        bookingService.createBooking('student-1', pastBookingData)
      ).rejects.toThrow(BookingValidationError);
    });

    it('should throw error if no availability found', async () => {
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([]);

      await expect(
        bookingService.createBooking('student-1', mockBookingData)
      ).rejects.toThrow(BookingValidationError);
    });

    it('should throw error if booking conflicts exist', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([
        {
          id: 'existing-booking',
          startTime: '10:00',
          endTime: '11:00',
          status: BookingStatus.CONFIRMED,
        },
      ]);

      await expect(
        bookingService.createBooking('student-1', mockBookingData)
      ).rejects.toThrow(BookingConflictError);
    });
  });

  describe('getBookingById', () => {
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

    it('should return booking for authorized student', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await bookingService.getBookingById('booking-1', 'student-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('booking-1');
    });

    it('should return booking for authorized tutor', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await bookingService.getBookingById('booking-1', 'tutor-user-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('booking-1');
    });

    it('should throw error for unauthorized user', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking);

      await expect(
        bookingService.getBookingById('booking-1', 'unauthorized-user')
      ).rejects.toThrow(BookingPermissionError);
    });

    it('should throw error if booking not found', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      await expect(
        bookingService.getBookingById('invalid-booking', 'student-1')
      ).rejects.toThrow(BookingValidationError);
    });
  });

  describe('cancelBooking', () => {
    const mockBooking = {
      id: 'booking-1',
      studentId: 'student-1',
      tutorId: 'tutor-1',
      status: BookingStatus.PENDING,
      tutor: { userId: 'tutor-user-1', user: { email: 'tutor@test.com' } },
      student: { id: 'student-1', email: 'student@test.com' },
      scheduledDate: new Date('2024-12-20'),
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
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

      const result = await bookingService.cancelBooking('booking-1', 'student-1', {
        cancellationReason: 'Schedule conflict',
      });

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: expect.objectContaining({
          status: BookingStatus.CANCELLED,
          cancelledBy: 'student-1',
          cancellationReason: 'Schedule conflict',
        }),
        include: expect.any(Object),
      });
    });

    it('should throw error if booking already cancelled', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      await expect(
        bookingService.cancelBooking('booking-1', 'student-1', {})
      ).rejects.toThrow(BookingValidationError);
    });

    it('should throw error if booking already completed', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.COMPLETED,
      });

      await expect(
        bookingService.cancelBooking('booking-1', 'student-1', {})
      ).rejects.toThrow(BookingValidationError);
    });
  });
});
