// Re-export types from the booking service for consistency
export type {
  TimeSlot,
  BookingRequest,
  BookingResponse,
  TutorDetails,
  UpdateBookingRequest,
  CancelBookingRequest,
  ConfirmBookingRequest,
  BookingListResponse,
  BookingQueryParams
} from '../../../services/bookingService';

// Component-specific types
export interface BookingDate {
  date: Date;
  available: boolean;
  timeSlots?: string[];
}

export interface BookingDetails {
  tutorId: string;
  tutorName: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  price: number;
  subject?: string;
  qualificationLevel?: string;
  lessonType?: 'REGULAR' | 'TRIAL' | 'ASSESSMENT' | 'EXAM_PREP' | 'HOMEWORK_HELP';
  teachingMode?: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
}

export interface AvailabilityCalendarProps {
  availableDates: Date[];
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[]; // Updated to use TimeSlot interface
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  date: Date;
  loading?: boolean;
}

export interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookingDetails: BookingDetails;
  loading?: boolean;
}