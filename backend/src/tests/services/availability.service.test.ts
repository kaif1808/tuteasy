import { AvailabilityService } from '../../services/availability.service';
import { PrismaClient } from '@prisma/client';
import { BookingStatus } from '../../types/booking.types';
import {
  BookingValidationError,
  BookingPermissionError
} from '../../types/booking.errors';

// Mock Prisma
jest.mock('@prisma/client');
const mockPrisma = {
  tutor: {
    findUnique: jest.fn(),
  },
  tutorAvailability: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  booking: {
    findMany: jest.fn(),
  },
};

// Mock the PrismaClient constructor
(PrismaClient as jest.MockedClass<typeof PrismaClient>).mockImplementation(() => mockPrisma as any);

describe('AvailabilityService', () => {
  let availabilityService: AvailabilityService;

  beforeEach(() => {
    availabilityService = new AvailabilityService(mockPrisma as any);
    jest.clearAllMocks();
  });

  describe('createAvailability', () => {
    const mockTutor = {
      id: 'tutor-1',
      userId: 'tutor-user-1',
      isActive: true,
      verificationStatus: 'VERIFIED',
    };

    const mockAvailabilityData = {
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: true,
      slotDuration: 60,
      bufferTime: 15,
      maxBookings: 1,
    };

    beforeEach(() => {
      mockPrisma.tutor.findUnique.mockResolvedValue(mockTutor);
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([]); // No overlapping slots
    });

    it('should create availability slot successfully', async () => {
      const mockCreatedAvailability = {
        id: 'availability-1',
        tutorId: 'tutor-1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: true,
        isActive: true,
        slotDuration: 60,
        bufferTime: 15,
        maxBookings: 1,
        timezone: 'Europe/London',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.tutorAvailability.create.mockResolvedValue(mockCreatedAvailability);

      const result = await availabilityService.createAvailability('tutor-user-1', mockAvailabilityData);

      expect(result).toBeDefined();
      expect(result.id).toBe('availability-1');
      expect(result.dayOfWeek).toBe(1);
      expect(result.startTime).toBe('09:00');
      expect(result.endTime).toBe('17:00');
      expect(mockPrisma.tutorAvailability.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tutorId: 'tutor-1',
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: true,
          slotDuration: 60,
          bufferTime: 15,
          maxBookings: 1,
        }),
      });
    });

    it('should throw error if user is not a tutor', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue(null);

      await expect(
        availabilityService.createAvailability('non-tutor-user', mockAvailabilityData)
      ).rejects.toThrow(BookingPermissionError);
    });

    it('should throw error if overlapping availability exists', async () => {
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([
        {
          id: 'existing-availability',
          tutorId: 'tutor-1',
          dayOfWeek: 1,
          startTime: '08:00',
          endTime: '12:00',
          isActive: true,
        },
      ]);

      await expect(
        availabilityService.createAvailability('tutor-user-1', mockAvailabilityData)
      ).rejects.toThrow(BookingValidationError);
    });
  });

  describe('updateAvailability', () => {
    const mockTutor = {
      id: 'tutor-1',
      userId: 'tutor-user-1',
    };

    const mockExistingAvailability = {
      id: 'availability-1',
      tutorId: 'tutor-1',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: true,
      isActive: true,
    };

    beforeEach(() => {
      mockPrisma.tutor.findUnique.mockResolvedValue(mockTutor);
      mockPrisma.tutorAvailability.findUnique.mockResolvedValue(mockExistingAvailability);
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([]); // No overlapping slots
    });

    it('should update availability slot successfully', async () => {
      const updateData = {
        startTime: '10:00',
        endTime: '16:00',
        isActive: false,
      };

      const updatedAvailability = {
        ...mockExistingAvailability,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.tutorAvailability.update.mockResolvedValue(updatedAvailability);

      const result = await availabilityService.updateAvailability(
        'availability-1',
        'tutor-user-1',
        updateData
      );

      expect(result).toBeDefined();
      expect(result.startTime).toBe('10:00');
      expect(result.endTime).toBe('16:00');
      expect(result.isActive).toBe(false);
      expect(mockPrisma.tutorAvailability.update).toHaveBeenCalledWith({
        where: { id: 'availability-1' },
        data: updateData,
      });
    });

    it('should throw error if availability not found', async () => {
      mockPrisma.tutorAvailability.findUnique.mockResolvedValue(null);

      await expect(
        availabilityService.updateAvailability('invalid-availability', 'tutor-user-1', {
          startTime: '10:00',
        })
      ).rejects.toThrow(BookingValidationError);
    });

    it('should throw error if user is not the owner', async () => {
      mockPrisma.tutorAvailability.findUnique.mockResolvedValue({
        ...mockExistingAvailability,
        tutorId: 'different-tutor',
      });

      await expect(
        availabilityService.updateAvailability('availability-1', 'tutor-user-1', {
          startTime: '10:00',
        })
      ).rejects.toThrow(BookingPermissionError);
    });
  });

  describe('deleteAvailability', () => {
    const mockTutor = {
      id: 'tutor-1',
      userId: 'tutor-user-1',
    };

    const mockAvailability = {
      id: 'availability-1',
      tutorId: 'tutor-1',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
    };

    beforeEach(() => {
      mockPrisma.tutor.findUnique.mockResolvedValue(mockTutor);
      mockPrisma.tutorAvailability.findUnique.mockResolvedValue(mockAvailability);
      mockPrisma.booking.findMany.mockResolvedValue([]); // No confirmed bookings
    });

    it('should delete availability slot successfully', async () => {
      await availabilityService.deleteAvailability('availability-1', 'tutor-user-1');

      expect(mockPrisma.tutorAvailability.delete).toHaveBeenCalledWith({
        where: { id: 'availability-1' },
      });
    });

    it('should throw error if availability has confirmed bookings', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([
        {
          id: 'booking-1',
          availabilityId: 'availability-1',
          status: BookingStatus.CONFIRMED,
        },
      ]);

      await expect(
        availabilityService.deleteAvailability('availability-1', 'tutor-user-1')
      ).rejects.toThrow(BookingValidationError);
    });

    it('should throw error if user is not the owner', async () => {
      mockPrisma.tutorAvailability.findUnique.mockResolvedValue({
        ...mockAvailability,
        tutorId: 'different-tutor',
      });

      await expect(
        availabilityService.deleteAvailability('availability-1', 'tutor-user-1')
      ).rejects.toThrow(BookingPermissionError);
    });
  });

  describe('getAvailableDates', () => {
    const mockTutor = {
      id: 'tutor-1',
      isActive: true,
    };

    beforeEach(() => {
      mockPrisma.tutor.findUnique.mockResolvedValue(mockTutor);
    });

    it('should return available dates for recurring slots', async () => {
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([
        {
          id: 'availability-1',
          tutorId: 'tutor-1',
          dayOfWeek: 1, // Monday
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: true,
          isActive: true,
        },
      ]);

      const result = await availabilityService.getAvailableDates('tutor-1', {});

      expect(result).toBeDefined();
      expect(result.dates).toBeInstanceOf(Array);
      expect(result.dates.length).toBeGreaterThan(0);
    });

    it('should return available dates for one-time slots', async () => {
      const specificDate = new Date('2024-12-20');
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([
        {
          id: 'availability-1',
          tutorId: 'tutor-1',
          specificDate,
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: false,
          isActive: true,
        },
      ]);

      // Mock the current date to be before the specific date
      const mockCurrentDate = new Date('2024-12-15');
      jest.spyOn(global, 'Date').mockImplementation(() => mockCurrentDate as any);

      const result = await availabilityService.getAvailableDates('tutor-1', {});

      expect(result).toBeDefined();
      expect(result.dates).toContain('2024-12-20');

      // Restore Date
      jest.restoreAllMocks();
    });

    it('should throw error if tutor not found', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue(null);

      await expect(
        availabilityService.getAvailableDates('invalid-tutor', {})
      ).rejects.toThrow(BookingValidationError);
    });
  });

  describe('getAvailableTimeSlots', () => {
    const mockTutor = {
      id: 'tutor-1',
      hourlyRateMin: 30.00,
    };

    beforeEach(() => {
      mockPrisma.tutor.findUnique.mockResolvedValue(mockTutor);
      mockPrisma.booking.findMany.mockResolvedValue([]); // No existing bookings
    });

    it('should return available time slots', async () => {
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([
        {
          id: 'availability-1',
          tutorId: 'tutor-1',
          dayOfWeek: 1, // Monday
          startTime: '09:00',
          endTime: '12:00',
          isRecurring: true,
          isActive: true,
          slotDuration: 60,
          bufferTime: 15,
        },
      ]);

      const result = await availabilityService.getAvailableTimeSlots('tutor-1', '2024-12-23'); // Monday

      expect(result).toBeDefined();
      expect(result.date).toBe('2024-12-23');
      expect(result.timeSlots).toBeInstanceOf(Array);
      expect(result.timeSlots.length).toBeGreaterThan(0);
      expect(result.timeSlots[0]).toHaveProperty('time');
      expect(result.timeSlots[0]).toHaveProperty('available');
      expect(result.timeSlots[0]).toHaveProperty('price');
    });

    it('should return empty array if no availability', async () => {
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([]);

      const result = await availabilityService.getAvailableTimeSlots('tutor-1', '2024-12-23');

      expect(result).toBeDefined();
      expect(result.date).toBe('2024-12-23');
      expect(result.timeSlots).toEqual([]);
    });

    it('should mark slots as unavailable if booked', async () => {
      mockPrisma.tutorAvailability.findMany.mockResolvedValue([
        {
          id: 'availability-1',
          tutorId: 'tutor-1',
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '12:00',
          isRecurring: true,
          isActive: true,
          slotDuration: 60,
          bufferTime: 15,
        },
      ]);

      mockPrisma.booking.findMany.mockResolvedValue([
        {
          startTime: '09:00',
          endTime: '10:00',
          status: BookingStatus.CONFIRMED,
        },
      ]);

      const result = await availabilityService.getAvailableTimeSlots('tutor-1', '2024-12-23');

      expect(result.timeSlots.some(slot => slot.time === '09:00' && !slot.available)).toBe(true);
    });
  });
});
