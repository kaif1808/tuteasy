// import { z } from 'zod'; // Moved to validation file

// Enums matching Prisma schema
export enum LessonType {
  REGULAR = 'REGULAR',
  TRIAL = 'TRIAL',
  ASSESSMENT = 'ASSESSMENT',
  EXAM_PREP = 'EXAM_PREP',
  HOMEWORK_HELP = 'HOMEWORK_HELP',
}

export enum TeachingMode {
  ONLINE = 'ONLINE',
  IN_PERSON = 'IN_PERSON',
  HYBRID = 'HYBRID',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW_STUDENT = 'NO_SHOW_STUDENT',
  NO_SHOW_TUTOR = 'NO_SHOW_TUTOR',
  RESCHEDULED = 'RESCHEDULED',
}

// Core booking interfaces
export interface TutorAvailability {
  id: string;
  tutorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  isActive: boolean;
  specificDate?: Date;
  validFrom?: Date;
  validUntil?: Date;
  slotDuration: number;
  bufferTime: number;
  maxBookings: number;
  timezone: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  studentId: string;
  tutorId: string;
  availabilityId?: string;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  subject?: string;
  qualificationLevel?: string;
  lessonType: LessonType;
  teachingMode: TeachingMode;
  status: BookingStatus;
  confirmationCode?: string;
  hourlyRate: number;
  totalPrice: number;
  currency: string;
  studentNotes?: string;
  tutorNotes?: string;
  internalNotes?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
  rescheduledFrom?: string;
  meetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
}

// API request/response interfaces
export interface CreateBookingRequest {
  tutorId: string;
  scheduledDate: string; // ISO date string
  startTime: string; // HH:MM format
  duration: number; // minutes
  subject?: string;
  qualificationLevel?: string;
  lessonType?: LessonType;
  teachingMode?: TeachingMode;
  studentNotes?: string;
}

export interface UpdateBookingRequest {
  scheduledDate?: string;
  startTime?: string;
  duration?: number;
  subject?: string;
  qualificationLevel?: string;
  lessonType?: LessonType;
  teachingMode?: TeachingMode;
  studentNotes?: string;
  tutorNotes?: string;
}

export interface CancelBookingRequest {
  cancellationReason?: string;
}

export interface ConfirmBookingRequest {
  tutorNotes?: string;
  meetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
}

export interface BookingResponse {
  id: string;
  bookingNumber: string;
  student: {
    id: string;
    email: string;
    gradeLevel?: string;
  };
  tutor: {
    id: string;
    userId: string;
    bio?: string;
    hourlyRateMin?: number;
    hourlyRateMax?: number;
    profileImageUrl?: string;
    user: {
      email: string;
    };
  };
  scheduledDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  subject?: string;
  qualificationLevel?: string;
  lessonType: LessonType;
  teachingMode: TeachingMode;
  status: BookingStatus;
  confirmationCode?: string;
  hourlyRate: number;
  totalPrice: number;
  currency: string;
  studentNotes?: string;
  tutorNotes?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  meetingUrl?: string;
  meetingId?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

export interface BookingListResponse {
  bookings: BookingResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Availability interfaces
export interface CreateAvailabilityRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring?: boolean;
  specificDate?: string;
  validFrom?: string;
  validUntil?: string;
  slotDuration?: number;
  bufferTime?: number;
  maxBookings?: number;
  timezone?: string;
  notes?: string;
}

export interface UpdateAvailabilityRequest {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  isRecurring?: boolean;
  isActive?: boolean;
  specificDate?: string;
  validFrom?: string;
  validUntil?: string;
  slotDuration?: number;
  bufferTime?: number;
  maxBookings?: number;
  timezone?: string;
  notes?: string;
}

export interface AvailabilityResponse {
  id: string;
  tutorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  isActive: boolean;
  specificDate?: string;
  validFrom?: string;
  validUntil?: string;
  slotDuration: number;
  bufferTime: number;
  maxBookings: number;
  timezone: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  price?: number;
  duration?: number;
}

export interface AvailableDatesResponse {
  dates: string[]; // ISO date strings
}

export interface AvailableTimeSlotsResponse {
  date: string;
  timeSlots: TimeSlot[];
}

// Query parameters for booking endpoints
export interface BookingQueryParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  tutorId?: string;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'scheduledDate' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface AvailabilityQueryParams {
  month?: string; // YYYY-MM format
  date?: string; // YYYY-MM-DD format
  includeBooked?: boolean;
}
