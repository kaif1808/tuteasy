import { z } from 'zod';
import { LessonType, TeachingMode, BookingStatus } from '../types/booking.types';
import { SUPPORTED_TIMEZONES } from '../utils/timezoneUtils';

// Helper schemas
const timeSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
  message: 'Time must be in HH:MM format (e.g., 09:00, 14:30)',
});

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
});

const isoDateTimeSchema = z.string().datetime({
  message: 'Must be a valid ISO datetime string',
});

const timezoneSchema = z.enum(SUPPORTED_TIMEZONES as unknown as [string, ...string[]], {
  errorMap: () => ({ message: 'Invalid timezone. Must be one of the supported timezones.' })
});

// Enum validation schemas
const lessonTypeSchema = z.nativeEnum(LessonType);
const teachingModeSchema = z.nativeEnum(TeachingMode);
const bookingStatusSchema = z.nativeEnum(BookingStatus);

// Booking validation schemas
export const createBookingSchema = z.object({
  body: z.object({
    tutorId: z.string().uuid('Invalid tutor ID format'),
    scheduledDate: dateSchema,
    startTime: timeSchema,
    duration: z.number()
      .int('Duration must be an integer')
      .min(15, 'Minimum lesson duration is 15 minutes')
      .max(480, 'Maximum lesson duration is 8 hours'),
    subject: z.string().min(1).max(100).optional(),
    qualificationLevel: z.string().min(1).max(50).optional(),
    lessonType: lessonTypeSchema.default(LessonType.REGULAR),
    teachingMode: teachingModeSchema.default(TeachingMode.ONLINE),
    studentNotes: z.string().max(1000, 'Student notes cannot exceed 1000 characters').optional(),
  }),
});

export const updateBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID format'),
  }),
  body: z.object({
    scheduledDate: dateSchema.optional(),
    startTime: timeSchema.optional(),
    duration: z.number()
      .int('Duration must be an integer')
      .min(15, 'Minimum lesson duration is 15 minutes')
      .max(480, 'Maximum lesson duration is 8 hours')
      .optional(),
    subject: z.string().min(1).max(100).optional(),
    qualificationLevel: z.string().min(1).max(50).optional(),
    lessonType: lessonTypeSchema.optional(),
    teachingMode: teachingModeSchema.optional(),
    studentNotes: z.string().max(1000, 'Student notes cannot exceed 1000 characters').optional(),
    tutorNotes: z.string().max(1000, 'Tutor notes cannot exceed 1000 characters').optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

export const cancelBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID format'),
  }),
  body: z.object({
    cancellationReason: z.string().max(500, 'Cancellation reason cannot exceed 500 characters').optional(),
  }),
});

export const confirmBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID format'),
  }),
  body: z.object({
    tutorNotes: z.string().max(1000, 'Tutor notes cannot exceed 1000 characters').optional(),
    meetingUrl: z.string().url('Invalid meeting URL format').optional(),
    meetingId: z.string().min(1).max(100).optional(),
    meetingPassword: z.string().min(1).max(50).optional(),
  }),
});

export const getBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID format'),
  }),
});

export const getBookingsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10'),
    status: bookingStatusSchema.optional(),
    tutorId: z.string().uuid().optional(),
    studentId: z.string().uuid().optional(),
    dateFrom: dateSchema.optional(),
    dateTo: dateSchema.optional(),
    sortBy: z.enum(['scheduledDate', 'createdAt', 'status']).default('scheduledDate'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }).refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    { message: 'dateFrom must be before or equal to dateTo' }
  ),
});

// Availability validation schemas
export const createAvailabilitySchema = z.object({
  body: z.object({
    dayOfWeek: z.number().int().min(0).max(6, 'Day of week must be 0-6 (Sunday-Saturday)'),
    startTime: timeSchema,
    endTime: timeSchema,
    isRecurring: z.boolean().default(true),
    specificDate: dateSchema.optional(),
    validFrom: dateSchema.optional(),
    validUntil: dateSchema.optional(),
    slotDuration: z.number().int().min(15).max(480).default(60),
    bufferTime: z.number().int().min(0).max(60).default(15),
    maxBookings: z.number().int().min(1).max(10).default(1),
    timezone: timezoneSchema.default('Europe/London'),
    notes: z.string().max(500).optional(),
  }).refine(
    (data) => {
      const start = data.startTime.split(':').map(Number);
      const end = data.endTime.split(':').map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      return startMinutes < endMinutes;
    },
    { message: 'Start time must be before end time' }
  ).refine(
    (data) => {
      if (!data.isRecurring && !data.specificDate) {
        return false;
      }
      return true;
    },
    { message: 'Non-recurring availability must have a specific date' }
  ).refine(
    (data) => {
      if (data.validFrom && data.validUntil) {
        return new Date(data.validFrom) <= new Date(data.validUntil);
      }
      return true;
    },
    { message: 'validFrom must be before or equal to validUntil' }
  ),
});

export const updateAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid availability ID format'),
  }),
  body: z.object({
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    isRecurring: z.boolean().optional(),
    isActive: z.boolean().optional(),
    specificDate: dateSchema.optional(),
    validFrom: dateSchema.optional(),
    validUntil: dateSchema.optional(),
    slotDuration: z.number().int().min(15).max(480).optional(),
    bufferTime: z.number().int().min(0).max(60).optional(),
    maxBookings: z.number().int().min(1).max(10).optional(),
    notes: z.string().max(500).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ).refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const start = data.startTime.split(':').map(Number);
        const end = data.endTime.split(':').map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];
        return startMinutes < endMinutes;
      }
      return true;
    },
    { message: 'Start time must be before end time' }
  ),
});

export const deleteAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid availability ID format'),
  }),
});

export const getAvailabilitySchema = z.object({
  params: z.object({
    tutorId: z.string().uuid('Invalid tutor ID format'),
  }),
});

export const getAvailableDatesSchema = z.object({
  params: z.object({
    tutorId: z.string().uuid('Invalid tutor ID format'),
  }),
  query: z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format').optional(),
  }),
});

export const getAvailableTimeSlotsSchema = z.object({
  params: z.object({
    tutorId: z.string().uuid('Invalid tutor ID format'),
  }),
  query: z.object({
    date: dateSchema,
  }),
});

// Export types for use in controllers
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>;
export type GetBookingInput = z.infer<typeof getBookingSchema>;
export type GetBookingsInput = z.infer<typeof getBookingsSchema>;

export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type DeleteAvailabilityInput = z.infer<typeof deleteAvailabilitySchema>;
export type GetAvailabilityInput = z.infer<typeof getAvailabilitySchema>;
export type GetAvailableDatesInput = z.infer<typeof getAvailableDatesSchema>;
export type GetAvailableTimeSlotsInput = z.infer<typeof getAvailableTimeSlotsSchema>;
