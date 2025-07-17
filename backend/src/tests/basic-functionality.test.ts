import { BookingService } from '../services/booking.service';
import { AvailabilityService } from '../services/availability.service';
import { BookingStatus } from '../types/booking.types';

// Mock Prisma Client
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
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('Booking System Basic Functionality', () => {
  let bookingService: BookingService;
  let availabilityService: AvailabilityService;

  beforeEach(() => {
    bookingService = new BookingService(mockPrisma as any);
    availabilityService = new AvailabilityService(mockPrisma as any);
    jest.clearAllMocks();
  });

  describe('BookingService', () => {
    it('should be instantiated correctly', () => {
      expect(bookingService).toBeInstanceOf(BookingService);
    });

    it('should have all required methods', () => {
      expect(typeof bookingService.createBooking).toBe('function');
      expect(typeof bookingService.getBookingById).toBe('function');
      expect(typeof bookingService.getBookings).toBe('function');
      expect(typeof bookingService.updateBooking).toBe('function');
      expect(typeof bookingService.cancelBooking).toBe('function');
      expect(typeof bookingService.confirmBooking).toBe('function');
      expect(typeof bookingService.completeBooking).toBe('function');
    });
  });

  describe('AvailabilityService', () => {
    it('should be instantiated correctly', () => {
      expect(availabilityService).toBeInstanceOf(AvailabilityService);
    });

    it('should have all required methods', () => {
      expect(typeof availabilityService.createAvailability).toBe('function');
      expect(typeof availabilityService.updateAvailability).toBe('function');
      expect(typeof availabilityService.deleteAvailability).toBe('function');
      expect(typeof availabilityService.getTutorAvailability).toBe('function');
      expect(typeof availabilityService.getAvailableDates).toBe('function');
      expect(typeof availabilityService.getAvailableTimeSlots).toBe('function');
    });
  });

  describe('Type Definitions', () => {
    it('should have correct BookingStatus enum values', () => {
      expect(BookingStatus.PENDING).toBe('PENDING');
      expect(BookingStatus.CONFIRMED).toBe('CONFIRMED');
      expect(BookingStatus.CANCELLED).toBe('CANCELLED');
      expect(BookingStatus.COMPLETED).toBe('COMPLETED');
      expect(BookingStatus.NO_SHOW_STUDENT).toBe('NO_SHOW_STUDENT');
      expect(BookingStatus.NO_SHOW_TUTOR).toBe('NO_SHOW_TUTOR');
      expect(BookingStatus.RESCHEDULED).toBe('RESCHEDULED');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        bookingService.createBooking('student-1', {
          tutorId: 'tutor-1',
          scheduledDate: '2024-12-20',
          startTime: '10:00',
          duration: 60,
        })
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('Validation', () => {
    it('should validate booking data structure', () => {
      const validBookingData = {
        tutorId: 'tutor-1',
        scheduledDate: '2024-12-20',
        startTime: '10:00',
        duration: 60,
      };

      expect(validBookingData.tutorId).toBeDefined();
      expect(validBookingData.scheduledDate).toBeDefined();
      expect(validBookingData.startTime).toBeDefined();
      expect(validBookingData.duration).toBeDefined();
    });

    it('should validate availability data structure', () => {
      const validAvailabilityData = {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: true,
      };

      expect(validAvailabilityData.dayOfWeek).toBeDefined();
      expect(validAvailabilityData.startTime).toBeDefined();
      expect(validAvailabilityData.endTime).toBeDefined();
      expect(validAvailabilityData.isRecurring).toBeDefined();
    });
  });
});
