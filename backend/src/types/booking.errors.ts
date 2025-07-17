// Booking-specific error types and codes
export enum BookingErrorCode {
  // Availability errors
  TUTOR_NOT_AVAILABLE = 'TUTOR_NOT_AVAILABLE',
  TIME_SLOT_UNAVAILABLE = 'TIME_SLOT_UNAVAILABLE',
  INVALID_TIME_SLOT = 'INVALID_TIME_SLOT',
  AVAILABILITY_NOT_FOUND = 'AVAILABILITY_NOT_FOUND',
  
  // Booking errors
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  BOOKING_ALREADY_CONFIRMED = 'BOOKING_ALREADY_CONFIRMED',
  BOOKING_ALREADY_CANCELLED = 'BOOKING_ALREADY_CANCELLED',
  BOOKING_ALREADY_COMPLETED = 'BOOKING_ALREADY_COMPLETED',
  BOOKING_CONFLICT = 'BOOKING_CONFLICT',
  BOOKING_TOO_LATE = 'BOOKING_TOO_LATE',
  BOOKING_TOO_EARLY = 'BOOKING_TOO_EARLY',
  
  // Permission errors
  UNAUTHORIZED_BOOKING_ACCESS = 'UNAUTHORIZED_BOOKING_ACCESS',
  CANNOT_BOOK_OWN_LESSONS = 'CANNOT_BOOK_OWN_LESSONS',
  TUTOR_NOT_VERIFIED = 'TUTOR_NOT_VERIFIED',
  TUTOR_INACTIVE = 'TUTOR_INACTIVE',
  
  // Validation errors
  INVALID_DURATION = 'INVALID_DURATION',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  PAST_DATE_BOOKING = 'PAST_DATE_BOOKING',
  WEEKEND_BOOKING_RESTRICTED = 'WEEKEND_BOOKING_RESTRICTED',
  
  // Payment errors
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  PAYMENT_METHOD_REQUIRED = 'PAYMENT_METHOD_REQUIRED',
  PAYMENT_PROCESSING_FAILED = 'PAYMENT_PROCESSING_FAILED',
  
  // System errors
  CALENDAR_INTEGRATION_FAILED = 'CALENDAR_INTEGRATION_FAILED',
  EMAIL_NOTIFICATION_FAILED = 'EMAIL_NOTIFICATION_FAILED',
  MEETING_CREATION_FAILED = 'MEETING_CREATION_FAILED',
}

export interface BookingError {
  code: BookingErrorCode;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export class BookingValidationError extends Error {
  public readonly code: BookingErrorCode;
  public readonly details?: Record<string, any>;
  public readonly field?: string;

  constructor(code: BookingErrorCode, message: string, details?: Record<string, any>, field?: string) {
    super(message);
    this.name = 'BookingValidationError';
    this.code = code;
    this.details = details;
    this.field = field;
  }
}

export class BookingConflictError extends Error {
  public readonly code: BookingErrorCode;
  public readonly conflictingBookingId?: string;
  public readonly details?: Record<string, any>;

  constructor(message: string, conflictingBookingId?: string, details?: Record<string, any>) {
    super(message);
    this.name = 'BookingConflictError';
    this.code = BookingErrorCode.BOOKING_CONFLICT;
    this.conflictingBookingId = conflictingBookingId;
    this.details = details;
  }
}

export class BookingPermissionError extends Error {
  public readonly code: BookingErrorCode;
  public readonly userId?: string;
  public readonly resourceId?: string;

  constructor(code: BookingErrorCode, message: string, userId?: string, resourceId?: string) {
    super(message);
    this.name = 'BookingPermissionError';
    this.code = code;
    this.userId = userId;
    this.resourceId = resourceId;
  }
}

// Error message mappings
export const BookingErrorMessages: Record<BookingErrorCode, string> = {
  [BookingErrorCode.TUTOR_NOT_AVAILABLE]: 'The selected tutor is not available at this time',
  [BookingErrorCode.TIME_SLOT_UNAVAILABLE]: 'The selected time slot is no longer available',
  [BookingErrorCode.INVALID_TIME_SLOT]: 'The selected time slot is invalid',
  [BookingErrorCode.AVAILABILITY_NOT_FOUND]: 'Availability slot not found',
  
  [BookingErrorCode.BOOKING_NOT_FOUND]: 'Booking not found',
  [BookingErrorCode.BOOKING_ALREADY_CONFIRMED]: 'This booking has already been confirmed',
  [BookingErrorCode.BOOKING_ALREADY_CANCELLED]: 'This booking has already been cancelled',
  [BookingErrorCode.BOOKING_ALREADY_COMPLETED]: 'This booking has already been completed',
  [BookingErrorCode.BOOKING_CONFLICT]: 'There is a scheduling conflict with this booking',
  [BookingErrorCode.BOOKING_TOO_LATE]: 'Bookings must be made at least 2 hours in advance',
  [BookingErrorCode.BOOKING_TOO_EARLY]: 'Bookings cannot be made more than 3 months in advance',
  
  [BookingErrorCode.UNAUTHORIZED_BOOKING_ACCESS]: 'You do not have permission to access this booking',
  [BookingErrorCode.CANNOT_BOOK_OWN_LESSONS]: 'You cannot book lessons with yourself',
  [BookingErrorCode.TUTOR_NOT_VERIFIED]: 'This tutor has not been verified yet',
  [BookingErrorCode.TUTOR_INACTIVE]: 'This tutor is currently inactive',
  
  [BookingErrorCode.INVALID_DURATION]: 'Invalid lesson duration specified',
  [BookingErrorCode.INVALID_DATE_RANGE]: 'Invalid date range specified',
  [BookingErrorCode.PAST_DATE_BOOKING]: 'Cannot book lessons in the past',
  [BookingErrorCode.WEEKEND_BOOKING_RESTRICTED]: 'Weekend bookings are restricted for this tutor',
  
  [BookingErrorCode.INSUFFICIENT_BALANCE]: 'Insufficient balance to complete this booking',
  [BookingErrorCode.PAYMENT_METHOD_REQUIRED]: 'A valid payment method is required',
  [BookingErrorCode.PAYMENT_PROCESSING_FAILED]: 'Payment processing failed',
  
  [BookingErrorCode.CALENDAR_INTEGRATION_FAILED]: 'Failed to sync with calendar',
  [BookingErrorCode.EMAIL_NOTIFICATION_FAILED]: 'Failed to send email notification',
  [BookingErrorCode.MEETING_CREATION_FAILED]: 'Failed to create online meeting',
};

// Helper function to create booking errors
export function createBookingError(
  code: BookingErrorCode,
  details?: Record<string, any>,
  field?: string
): BookingValidationError {
  const message = BookingErrorMessages[code];
  return new BookingValidationError(code, message, details, field);
}

// Response format for API errors
export interface BookingErrorResponse {
  success: false;
  error: {
    code: BookingErrorCode;
    message: string;
    details?: Record<string, any>;
    field?: string;
  };
  timestamp: string;
  path?: string;
}

// Success response format
export interface BookingSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

// Generic API response type
export type BookingApiResponse<T = any> = BookingSuccessResponse<T> | BookingErrorResponse;
