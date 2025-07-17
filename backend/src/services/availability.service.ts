import { PrismaClient } from '@prisma/client';
import {
  CreateAvailabilityRequest,
  UpdateAvailabilityRequest,
  AvailabilityResponse,
  TimeSlot,
  AvailableDatesResponse,
  AvailableTimeSlotsResponse,
  AvailabilityQueryParams,
  BookingStatus
} from '../types/booking.types';
import {
  BookingErrorCode,
  BookingPermissionError,
  createBookingError
} from '../types/booking.errors';
import { auditLogger, AuditEventType } from '../utils/auditLogger';
import {
  validateTimezone,
  timeRangesOverlap,
  getCurrentTimeInTimezone,
  formatDateForTimezone
} from '../utils/timezoneUtils';

export class AvailabilityService {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }
  /**
   * Create availability slot for a tutor
   */
  async createAvailability(
    tutorUserId: string,
    availabilityData: CreateAvailabilityRequest
  ): Promise<AvailabilityResponse> {
    // Get tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { userId: tutorUserId }
    });

    if (!tutor) {
      throw new BookingPermissionError(
        BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
        'Only tutors can create availability slots',
        tutorUserId
      );
    }

    // Check for overlapping availability slots
    await this.checkAvailabilityOverlap(
      tutor.id,
      availabilityData.dayOfWeek,
      availabilityData.startTime,
      availabilityData.endTime,
      availabilityData.specificDate ? new Date(availabilityData.specificDate) : undefined
    );

    // Validate timezone if provided
    const timezone = availabilityData.timezone || 'Europe/London';
    if (!validateTimezone(timezone)) {
      throw createBookingError(BookingErrorCode.INVALID_TIME_SLOT, {
        field: 'timezone',
        value: timezone
      });
    }

    // Create availability slot
    const availability = await this.prisma.tutorAvailability.create({
      data: {
        tutorId: tutor.id,
        dayOfWeek: availabilityData.dayOfWeek,
        startTime: availabilityData.startTime,
        endTime: availabilityData.endTime,
        isRecurring: availabilityData.isRecurring ?? true,
        specificDate: availabilityData.specificDate ? new Date(availabilityData.specificDate) : null,
        validFrom: availabilityData.validFrom ? new Date(availabilityData.validFrom) : null,
        validUntil: availabilityData.validUntil ? new Date(availabilityData.validUntil) : null,
        slotDuration: availabilityData.slotDuration ?? 60,
        bufferTime: availabilityData.bufferTime ?? 15,
        maxBookings: availabilityData.maxBookings ?? 1,
        timezone: timezone,
        notes: availabilityData.notes,
      }
    });

    // Log availability creation audit event
    await auditLogger.logAvailabilityEvent(
      AuditEventType.AVAILABILITY_CREATED,
      tutorUserId,
      availability.id,
      undefined,
      {
        dayOfWeek: availabilityData.dayOfWeek,
        startTime: availabilityData.startTime,
        endTime: availabilityData.endTime,
        isRecurring: availabilityData.isRecurring ?? true,
        timezone: timezone,
        slotDuration: availabilityData.slotDuration ?? 60,
        bufferTime: availabilityData.bufferTime ?? 15
      },
      {
        tutorId: tutor.id,
        specificDate: availabilityData.specificDate
      }
    );

    return this.formatAvailabilityResponse(availability);
  }

  /**
   * Update availability slot
   */
  async updateAvailability(
    availabilityId: string,
    tutorUserId: string,
    updateData: UpdateAvailabilityRequest
  ): Promise<AvailabilityResponse> {
    // Get tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { userId: tutorUserId }
    });

    if (!tutor) {
      throw new BookingPermissionError(
        BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
        'Only tutors can update availability slots',
        tutorUserId
      );
    }

    // Check if availability exists and belongs to tutor
    const existingAvailability = await this.prisma.tutorAvailability.findUnique({
      where: { id: availabilityId }
    });

    if (!existingAvailability) {
      throw createBookingError(BookingErrorCode.AVAILABILITY_NOT_FOUND);
    }

    if (existingAvailability.tutorId !== tutor.id) {
      throw new BookingPermissionError(
        BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
        'You can only update your own availability slots',
        tutorUserId,
        availabilityId
      );
    }

    // Check for overlapping availability if time/day changed
    if (updateData.dayOfWeek !== undefined || updateData.startTime || updateData.endTime || updateData.specificDate !== undefined) {
      await this.checkAvailabilityOverlap(
        tutor.id,
        updateData.dayOfWeek ?? existingAvailability.dayOfWeek,
        updateData.startTime ?? existingAvailability.startTime,
        updateData.endTime ?? existingAvailability.endTime,
        updateData.specificDate ? new Date(updateData.specificDate) : existingAvailability.specificDate || undefined,
        availabilityId // Exclude current availability from overlap check
      );
    }

    // Prepare update data
    const updateFields: any = {};
    
    if (updateData.dayOfWeek !== undefined) updateFields.dayOfWeek = updateData.dayOfWeek;
    if (updateData.startTime) updateFields.startTime = updateData.startTime;
    if (updateData.endTime) updateFields.endTime = updateData.endTime;
    if (updateData.isRecurring !== undefined) updateFields.isRecurring = updateData.isRecurring;
    if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive;
    if (updateData.specificDate !== undefined) {
      updateFields.specificDate = updateData.specificDate ? new Date(updateData.specificDate) : null;
    }
    if (updateData.validFrom !== undefined) {
      updateFields.validFrom = updateData.validFrom ? new Date(updateData.validFrom) : null;
    }
    if (updateData.validUntil !== undefined) {
      updateFields.validUntil = updateData.validUntil ? new Date(updateData.validUntil) : null;
    }
    if (updateData.slotDuration !== undefined) updateFields.slotDuration = updateData.slotDuration;
    if (updateData.bufferTime !== undefined) updateFields.bufferTime = updateData.bufferTime;
    if (updateData.maxBookings !== undefined) updateFields.maxBookings = updateData.maxBookings;
    if (updateData.notes !== undefined) updateFields.notes = updateData.notes;

    // Update availability
    const updatedAvailability = await this.prisma.tutorAvailability.update({
      where: { id: availabilityId },
      data: updateFields
    });

    return this.formatAvailabilityResponse(updatedAvailability);
  }

  /**
   * Delete availability slot
   */
  async deleteAvailability(availabilityId: string, tutorUserId: string): Promise<void> {
    // Get tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { userId: tutorUserId }
    });

    if (!tutor) {
      throw new BookingPermissionError(
        BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
        'Only tutors can delete availability slots',
        tutorUserId
      );
    }

    // Check if availability exists and belongs to tutor
    const availability = await this.prisma.tutorAvailability.findUnique({
      where: { id: availabilityId }
    });

    if (!availability) {
      throw createBookingError(BookingErrorCode.AVAILABILITY_NOT_FOUND);
    }

    if (availability.tutorId !== tutor.id) {
      throw new BookingPermissionError(
        BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS,
        'You can only delete your own availability slots',
        tutorUserId,
        availabilityId
      );
    }

    // Check if there are any confirmed bookings for this availability
    const confirmedBookings = await this.prisma.booking.findMany({
      where: {
        availabilityId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] }
      }
    });

    if (confirmedBookings.length > 0) {
      throw createBookingError(
        BookingErrorCode.BOOKING_CONFLICT,
        { confirmedBookingsCount: confirmedBookings.length }
      );
    }

    // Delete availability
    await this.prisma.tutorAvailability.delete({
      where: { id: availabilityId }
    });
  }

  /**
   * Get tutor's availability slots
   */
  async getTutorAvailability(tutorId: string): Promise<AvailabilityResponse[]> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId }
    });

    if (!tutor) {
      throw createBookingError(BookingErrorCode.TUTOR_NOT_AVAILABLE);
    }

    const availabilitySlots = await this.prisma.tutorAvailability.findMany({
      where: {
        tutorId,
        isActive: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return availabilitySlots.map(slot => this.formatAvailabilityResponse(slot));
  }

  /**
   * Get available dates for a tutor
   */
  async getAvailableDates(
    tutorId: string,
    queryParams: AvailabilityQueryParams
  ): Promise<AvailableDatesResponse> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId }
    });

    if (!tutor) {
      throw createBookingError(BookingErrorCode.TUTOR_NOT_AVAILABLE);
    }

    // Determine date range
    const now = new Date();
    const startDate = queryParams.month 
      ? new Date(`${queryParams.month}-01`)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    
    const endDate = queryParams.month
      ? new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      : new Date(now.getFullYear(), now.getMonth() + 3, 0); // 3 months ahead

    // Get availability slots
    const availabilitySlots = await this.prisma.tutorAvailability.findMany({
      where: {
        tutorId,
        isActive: true,
        OR: [
          // Recurring slots
          {
            isRecurring: true,
            OR: [
              { validFrom: null, validUntil: null },
              { validFrom: { lte: endDate }, validUntil: null },
              { validFrom: null, validUntil: { gte: startDate } },
              { validFrom: { lte: endDate }, validUntil: { gte: startDate } },
            ]
          },
          // One-time slots
          {
            isRecurring: false,
            specificDate: {
              gte: startDate,
              lte: endDate
            }
          }
        ]
      }
    });

    // Generate available dates
    const availableDates = new Set<string>();
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const currentDateStr = current.toISOString().split('T')[0];

      // Check if there's availability for this date
      const hasAvailability = availabilitySlots.some(slot => {
        if (slot.isRecurring && slot.dayOfWeek === dayOfWeek) {
          // Check if date is within valid range
          if (slot.validFrom && current < slot.validFrom) return false;
          if (slot.validUntil && current > slot.validUntil) return false;
          return true;
        }
        
        if (!slot.isRecurring && slot.specificDate) {
          return slot.specificDate.toISOString().split('T')[0] === currentDateStr;
        }
        
        return false;
      });

      if (hasAvailability && current >= now) {
        availableDates.add(currentDateStr);
      }

      current.setDate(current.getDate() + 1);
    }

    return {
      dates: Array.from(availableDates).sort()
    };
  }

  /**
   * Get available time slots for a specific date
   */
  async getAvailableTimeSlots(
    tutorId: string,
    date: string
  ): Promise<AvailableTimeSlotsResponse> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId }
    });

    if (!tutor) {
      throw createBookingError(BookingErrorCode.TUTOR_NOT_AVAILABLE);
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    const dateStr = targetDate.toISOString().split('T')[0];

    // Get availability slots for this date
    const availabilitySlots = await this.prisma.tutorAvailability.findMany({
      where: {
        tutorId,
        isActive: true,
        OR: [
          // Recurring slots for this day of week
          {
            dayOfWeek,
            isRecurring: true,
            OR: [
              { validFrom: null, validUntil: null },
              { validFrom: { lte: targetDate }, validUntil: null },
              { validFrom: null, validUntil: { gte: targetDate } },
              { validFrom: { lte: targetDate }, validUntil: { gte: targetDate } },
            ]
          },
          // One-time slots for this specific date
          {
            specificDate: targetDate,
            isRecurring: false,
          }
        ]
      }
    });

    if (availabilitySlots.length === 0) {
      return {
        date: dateStr,
        timeSlots: []
      };
    }

    // Get existing bookings for this date
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        tutorId,
        scheduledDate: targetDate,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] }
      },
      select: {
        startTime: true,
        endTime: true,
        duration: true
      }
    });

    // Generate time slots
    const timeSlots: TimeSlot[] = [];

    for (const slot of availabilitySlots) {
      const slotTimeSlots = this.generateTimeSlotsForAvailability(
        slot,
        existingBookings,
        tutor
      );
      timeSlots.push(...slotTimeSlots);
    }

    // Remove duplicates and sort
    const uniqueTimeSlots = this.deduplicateTimeSlots(timeSlots);
    uniqueTimeSlots.sort((a, b) => a.time.localeCompare(b.time));

    return {
      date: dateStr,
      timeSlots: uniqueTimeSlots
    };
  }

  // ========== Helper Methods ==========

  /**
   * Check for overlapping availability slots
   */
  private async checkAvailabilityOverlap(
    tutorId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    specificDate?: Date,
    excludeAvailabilityId?: string
  ): Promise<void> {
    const whereClause: any = {
      tutorId,
      id: excludeAvailabilityId ? { not: excludeAvailabilityId } : undefined,
      isActive: true,
    };

    if (specificDate) {
      // Check for one-time slots on the same date
      whereClause.OR = [
        {
          specificDate,
          isRecurring: false,
          OR: [
            { startTime: { lt: endTime }, endTime: { gt: startTime } }
          ]
        }
      ];
    } else {
      // Check for recurring slots on the same day of week
      whereClause.dayOfWeek = dayOfWeek;
      whereClause.isRecurring = true;
      whereClause.OR = [
        { startTime: { lt: endTime }, endTime: { gt: startTime } }
      ];
    }

    const overlappingSlots = await this.prisma.tutorAvailability.findMany({
      where: whereClause
    });

    if (overlappingSlots.length > 0) {
      throw createBookingError(
        BookingErrorCode.TIME_SLOT_UNAVAILABLE,
        { overlappingSlotId: overlappingSlots[0].id }
      );
    }
  }

  /**
   * Generate time slots for an availability slot
   */
  private generateTimeSlotsForAvailability(
    availability: any,
    existingBookings: any[],
    tutor: any
  ): TimeSlot[] {
    const timeSlots: TimeSlot[] = [];
    const slotDuration = availability.slotDuration;
    const bufferTime = availability.bufferTime;

    // Parse start and end times
    const [startHour, startMin] = availability.startTime.split(':').map(Number);
    const [endHour, endMin] = availability.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Generate slots
    for (let currentMinutes = startMinutes; currentMinutes + slotDuration <= endMinutes; currentMinutes += slotDuration + bufferTime) {
      const slotStartTime = this.minutesToTimeString(currentMinutes);
      const slotEndTime = this.minutesToTimeString(currentMinutes + slotDuration);

      // Check if this slot conflicts with existing bookings
      const isAvailable = !existingBookings.some(booking => {
        return this.timeSlotsOverlap(
          slotStartTime,
          slotEndTime,
          booking.startTime,
          booking.endTime
        );
      });

      // Calculate price (use tutor's hourly rate)
      const hourlyRate = tutor.hourlyRateMin ? Number(tutor.hourlyRateMin) : 30.00;
      const price = (hourlyRate * slotDuration) / 60;

      timeSlots.push({
        time: slotStartTime,
        available: isAvailable,
        price: parseFloat(price.toFixed(2)),
        duration: slotDuration
      });
    }

    return timeSlots;
  }

  /**
   * Check if two time slots overlap
   */
  private timeSlotsOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    return start1 < end2 && start2 < end1;
  }

  /**
   * Convert minutes to HH:MM format
   */
  private minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Remove duplicate time slots
   */
  private deduplicateTimeSlots(timeSlots: TimeSlot[]): TimeSlot[] {
    const seen = new Set<string>();
    return timeSlots.filter(slot => {
      const key = `${slot.time}-${slot.duration}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Format availability response
   */
  private formatAvailabilityResponse(availability: any): AvailabilityResponse {
    return {
      id: availability.id,
      tutorId: availability.tutorId,
      dayOfWeek: availability.dayOfWeek,
      startTime: availability.startTime,
      endTime: availability.endTime,
      isRecurring: availability.isRecurring,
      isActive: availability.isActive,
      specificDate: availability.specificDate?.toISOString().split('T')[0],
      validFrom: availability.validFrom?.toISOString().split('T')[0],
      validUntil: availability.validUntil?.toISOString().split('T')[0],
      slotDuration: availability.slotDuration,
      bufferTime: availability.bufferTime,
      maxBookings: availability.maxBookings,
      timezone: availability.timezone,
      notes: availability.notes,
      createdAt: availability.createdAt.toISOString(),
      updatedAt: availability.updatedAt.toISOString(),
    };
  }
}
