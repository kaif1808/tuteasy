// Booking system types for TutEasy lesson booking
export interface BookingDate {
  date: Date;
  available: boolean;
  timeSlots?: string[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
  price?: number;
}

export interface BookingDetails {
  tutorId: string;
  tutorName: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  price: number;
  subject?: string;
}

export interface AvailabilityCalendarProps {
  availableDates: Date[];
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export interface TimeSlotSelectorProps {
  timeSlots: string[];
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