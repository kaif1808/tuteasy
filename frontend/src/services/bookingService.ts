import { api } from './api';

// Updated interfaces to match backend API
export interface TutorDetails {
  id: string;
  userId: string;
  bio?: string;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  profileImageUrl?: string;
  user: {
    email: string;
  };
}

export interface TimeSlot {
  time: string;
  available: boolean;
  price?: number;
  duration?: number;
}

export interface BookingRequest {
  tutorId: string;
  scheduledDate: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:MM format
  duration: number; // minutes
  subject?: string;
  qualificationLevel?: string;
  lessonType?: 'REGULAR' | 'TRIAL' | 'ASSESSMENT' | 'EXAM_PREP' | 'HOMEWORK_HELP';
  teachingMode?: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  studentNotes?: string;
}

export interface UpdateBookingRequest {
  scheduledDate?: string;
  startTime?: string;
  duration?: number;
  subject?: string;
  qualificationLevel?: string;
  lessonType?: 'REGULAR' | 'TRIAL' | 'ASSESSMENT' | 'EXAM_PREP' | 'HOMEWORK_HELP';
  teachingMode?: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
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
  lessonType: string;
  teachingMode: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW_STUDENT' | 'NO_SHOW_TUTOR' | 'RESCHEDULED';
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

export interface AvailableDatesResponse {
  dates: string[];
}

export interface AvailableTimeSlotsResponse {
  date: string;
  timeSlots: TimeSlot[];
}

export interface BookingQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  tutorId?: string;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'scheduledDate' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Error response interface
export interface BookingErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    field?: string;
  };
  timestamp: string;
}

// Success response interface
export interface BookingSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export class BookingService {
  // Get tutor details (using search API for now)
  static async getTutorDetails(tutorId: string): Promise<TutorDetails> {
    try {
      const response = await api.get<BookingSuccessResponse<TutorDetails>>(`/search/tutors/${tutorId}`);
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Get available dates for a tutor
  static async getAvailableDates(tutorId: string, month?: string): Promise<Date[]> {
    try {
      const params = month ? { month } : {};
      const response = await api.get<BookingSuccessResponse<AvailableDatesResponse>>(
        `/availability/tutors/${tutorId}/dates`,
        { params }
      );
      return response.data.data.dates.map(dateStr => new Date(dateStr));
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Get available time slots for a specific date
  static async getAvailableTimeSlots(tutorId: string, date: string): Promise<TimeSlot[]> {
    try {
      const response = await api.get<BookingSuccessResponse<AvailableTimeSlotsResponse>>(
        `/availability/tutors/${tutorId}/slots`,
        { params: { date } }
      );
      return response.data.data.timeSlots;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Create a booking
  static async createBooking(bookingData: BookingRequest): Promise<BookingResponse> {
    try {
      const response = await api.post<BookingSuccessResponse<BookingResponse>>('/bookings', bookingData);
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Get user's bookings
  static async getUserBookings(queryParams?: BookingQueryParams): Promise<BookingListResponse> {
    try {
      const response = await api.get<BookingSuccessResponse<BookingListResponse>>('/bookings', {
        params: queryParams
      });
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Get booking by ID
  static async getBookingById(bookingId: string): Promise<BookingResponse> {
    try {
      const response = await api.get<BookingSuccessResponse<BookingResponse>>(`/bookings/${bookingId}`);
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Update a booking
  static async updateBooking(bookingId: string, updateData: UpdateBookingRequest): Promise<BookingResponse> {
    try {
      const response = await api.put<BookingSuccessResponse<BookingResponse>>(`/bookings/${bookingId}`, updateData);
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Cancel a booking
  static async cancelBooking(bookingId: string, cancelData?: CancelBookingRequest): Promise<BookingResponse> {
    try {
      const response = await api.delete<BookingSuccessResponse<BookingResponse>>(`/bookings/${bookingId}`, {
        data: cancelData
      });
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Confirm a booking (tutor only)
  static async confirmBooking(bookingId: string, confirmData?: ConfirmBookingRequest): Promise<BookingResponse> {
    try {
      const response = await api.post<BookingSuccessResponse<BookingResponse>>(
        `/bookings/${bookingId}/confirm`,
        confirmData
      );
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Complete a booking
  static async completeBooking(bookingId: string): Promise<BookingResponse> {
    try {
      const response = await api.post<BookingSuccessResponse<BookingResponse>>(`/bookings/${bookingId}/complete`);
      return response.data.data;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  // Error handling helper
  private static handleApiError(error: any): Error {
    if (error.response?.data?.error) {
      const apiError = error.response.data as BookingErrorResponse;
      const errorMessage = apiError.error.message || 'An error occurred';
      const customError = new Error(errorMessage);
      (customError as any).code = apiError.error.code;
      (customError as any).details = apiError.error.details;
      (customError as any).field = apiError.error.field;
      return customError;
    }
    return error;
  }
}

// React Query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: BookingQueryParams) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  tutorDetails: (tutorId: string) => ['tutors', 'detail', tutorId] as const,
  availability: () => ['availability'] as const,
  availableDates: (tutorId: string, month?: string) => [...bookingKeys.availability(), 'dates', tutorId, month] as const,
  timeSlots: (tutorId: string, date: string) => [...bookingKeys.availability(), 'slots', tutorId, date] as const,
  userBookings: (params?: BookingQueryParams) => [...bookingKeys.lists(), 'user', params] as const,
};