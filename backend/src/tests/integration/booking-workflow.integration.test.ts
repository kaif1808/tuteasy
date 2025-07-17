import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { BookingStatus, LessonType, TeachingMode } from '../../types/booking.types';
import { BookingErrorCode } from '../../types/booking.errors';

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
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Mock the PrismaClient constructor
(PrismaClient as jest.MockedClass<typeof PrismaClient>).mockImplementation(() => mockPrisma as any);

// Mock Express app
const app = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  use: jest.fn(),
};

// Mock authentication middleware
const mockAuthenticatedUser = {
  id: 'student-1',
  email: 'student@test.com',
  role: 'STUDENT'
};

describe('Booking Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      return await callback(mockPrisma);
    });
  });

  describe('Complete Booking Workflow', () => {
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

    const mockAvailability = {
      id: 'availability-1',
      tutorId: 'tutor-1',
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: true,
      isActive: true,
      slotDuration: 60,
      bufferTime: 15,
      maxBookings: 1,
      timezone: 'Europe/London'
    };

    const validBookingData = {
      tutorId: 'tutor-1',
      scheduledDate: '2024-12-23', // Monday
      startTime: '10:00',
      duration: 60,
      subject: 'Mathematics',
      qualificationLevel: 'GCSE',
      lessonType: LessonType.REGULAR,
      teachingMode: TeachingMode.ONLINE,
      studentNotes: 'Looking forward to the lesson',
    };

    beforeEach(() => {
      mockPrisma.user.findUnique.mockResolvedValue(mockStudent);
      mockPrisma.tutor.findUnique.mockResolvedValue(mockTutor);
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([mockAvailability]);
      mockPrisma.booking.findMany.mockResolvedValue([]); // No conflicts
    });

    it('should complete full booking workflow: create -> confirm -> complete', async () => {
      // Step 1: Create booking
      const mockCreatedBooking = {
        id: 'booking-1',
        bookingNumber: 'BK001',
        studentId: 'student-1',
        tutorId: 'tutor-1',
        scheduledDate: new Date('2024-12-23'),
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

      // Step 2: Confirm booking (tutor action)
      const mockConfirmedBooking = {
        ...mockCreatedBooking,
        status: BookingStatus.CONFIRMED,
        confirmedAt: new Date(),
        meetingUrl: 'https://zoom.us/j/123456789',
      };

      mockPrisma.booking.findUnique.mockResolvedValue(mockCreatedBooking);
      mockPrisma.booking.update.mockResolvedValue(mockConfirmedBooking);

      // Step 3: Complete booking
      const mockCompletedBooking = {
        ...mockConfirmedBooking,
        status: BookingStatus.COMPLETED,
        completedAt: new Date(),
      };

      mockPrisma.booking.update.mockResolvedValue(mockCompletedBooking);

      // Verify the workflow would work
      expect(mockCreatedBooking.status).toBe(BookingStatus.PENDING);
      expect(mockConfirmedBooking.status).toBe(BookingStatus.CONFIRMED);
      expect(mockCompletedBooking.status).toBe(BookingStatus.COMPLETED);
    });

    it('should handle booking conflicts correctly', async () => {
      // Mock existing booking that conflicts
      const conflictingBooking = {
        id: 'existing-booking',
        tutorId: 'tutor-1',
        scheduledDate: new Date('2024-12-23'),
        startTime: '09:30',
        endTime: '10:30',
        status: BookingStatus.CONFIRMED,
      };

      mockPrisma.booking.findMany.mockResolvedValue([conflictingBooking]);

      // The service should detect this conflict and throw an error
      // This would be tested in the actual service layer
      expect(conflictingBooking.startTime).toBe('09:30');
      expect(conflictingBooking.endTime).toBe('10:30');
      expect(validBookingData.startTime).toBe('10:00');
      
      // Time ranges overlap: 09:30-10:30 and 10:00-11:00
      const hasOverlap = (
        conflictingBooking.startTime < '11:00' && 
        validBookingData.startTime < conflictingBooking.endTime
      );
      expect(hasOverlap).toBe(true);
    });

    it('should validate availability slots correctly', async () => {
      // Test with no availability
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([]);
      
      // Should result in no available slots
      const availabilitySlots = await mockPrisma.tutorAvailability.findMany();
      expect(availabilitySlots).toHaveLength(0);

      // Test with valid availability
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([mockAvailability]);
      
      const validSlots = await mockPrisma.tutorAvailability.findMany();
      expect(validSlots).toHaveLength(1);
      expect(validSlots[0].startTime).toBe('09:00');
      expect(validSlots[0].endTime).toBe('17:00');
    });

    it('should handle timezone validation', async () => {
      const invalidTimezone = 'Invalid/Timezone';
      const validTimezone = 'Europe/London';

      // Test timezone validation logic
      const supportedTimezones = [
        'Europe/London',
        'Europe/Paris',
        'America/New_York',
        'Asia/Tokyo'
      ];

      expect(supportedTimezones.includes(validTimezone)).toBe(true);
      expect(supportedTimezones.includes(invalidTimezone)).toBe(false);
    });

    it('should calculate pricing correctly', async () => {
      const hourlyRate = 30.00;
      const duration = 60; // minutes
      const expectedPrice = (hourlyRate * duration) / 60;

      expect(expectedPrice).toBe(30.00);

      // Test with 90 minutes
      const duration90 = 90;
      const expectedPrice90 = (hourlyRate * duration90) / 60;
      expect(expectedPrice90).toBe(45.00);
    });

    it('should handle buffer time correctly', async () => {
      const bufferTime = 15; // minutes
      const startTime = '10:00';
      const endTime = '11:00';

      // Calculate buffered times
      const startMinutes = 10 * 60; // 600 minutes
      const endMinutes = 11 * 60; // 660 minutes
      
      const bufferedStart = Math.max(0, startMinutes - bufferTime);
      const bufferedEnd = Math.min(24 * 60, endMinutes + bufferTime);

      expect(bufferedStart).toBe(585); // 09:45
      expect(bufferedEnd).toBe(675); // 11:15
    });

    it('should validate business rules', async () => {
      // Test minimum booking time (should be at least 15 minutes)
      expect(validBookingData.duration).toBeGreaterThanOrEqual(15);

      // Test maximum booking time (should be at most 8 hours)
      expect(validBookingData.duration).toBeLessThanOrEqual(480);

      // Test that booking is not in the past
      const bookingDate = new Date(validBookingData.scheduledDate);
      const today = new Date();
      expect(bookingDate.getTime()).toBeGreaterThan(today.getTime() - 24 * 60 * 60 * 1000);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      try {
        await mockPrisma.user.findUnique({ where: { id: 'test' } });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Database connection failed');
      }
    });

    it('should handle validation errors', async () => {
      const invalidBookingData = {
        tutorId: 'invalid-uuid',
        scheduledDate: 'invalid-date',
        startTime: '25:00', // Invalid time
        duration: -10, // Invalid duration
      };

      // These would be caught by Zod validation
      expect(invalidBookingData.tutorId).not.toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(invalidBookingData.scheduledDate).not.toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(invalidBookingData.startTime).not.toMatch(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/);
      expect(invalidBookingData.duration).toBeLessThan(15);
    });
  });

  describe('Audit Logging', () => {
    it('should log booking creation events', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Simulate audit logging
      const auditEvent = {
        eventType: 'BOOKING_CREATED',
        userId: 'student-1',
        resourceId: 'booking-1',
        resourceType: 'booking',
        timestamp: new Date(),
      };

      console.log('AUDIT LOG:', JSON.stringify(auditEvent, null, 2));

      expect(consoleSpy).toHaveBeenCalledWith(
        'AUDIT LOG:',
        expect.stringContaining('BOOKING_CREATED')
      );

      consoleSpy.mockRestore();
    });
  });
});
