import { api } from './api';

export interface TutorDetails {
  id: string;
  name: string;
  subject: string;
  rating: number;
  experience: number;
  hourlyRate: number;
  avatar?: string;
  bio?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BookingRequest {
  tutorId: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  duration: number; // minutes
  subject?: string;
  notes?: string;
}

export interface BookingResponse {
  id: string;
  tutorId: string;
  studentId: string;
  date: string;
  time: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  price: number;
  subject?: string;
  notes?: string;
  createdAt: string;
}

export class BookingService {
  // Get tutor details
  static async getTutorDetails(tutorId: string): Promise<TutorDetails> {
    const response = await api.get<{ success: boolean; data: TutorDetails }>(`/tutors/${tutorId}`);
    return response.data.data;
  }

  // Get available dates for a tutor
  static async getAvailableDates(tutorId: string, month?: string): Promise<Date[]> {
    const params = month ? { month } : {};
    const response = await api.get<{ success: boolean; data: string[] }>(`/tutors/${tutorId}/availability/dates`, { params });
    return response.data.data.map(dateStr => new Date(dateStr));
  }

  // Get available time slots for a specific date
  static async getAvailableTimeSlots(tutorId: string, date: string): Promise<TimeSlot[]> {
    const response = await api.get<{ success: boolean; data: TimeSlot[] }>(`/tutors/${tutorId}/availability/slots`, {
      params: { date }
    });
    return response.data.data;
  }

  // Create a booking
  static async createBooking(bookingData: BookingRequest): Promise<BookingResponse> {
    const response = await api.post<{ success: boolean; data: BookingResponse }>('/bookings', bookingData);
    return response.data.data;
  }

  // Get user's bookings
  static async getUserBookings(): Promise<BookingResponse[]> {
    const response = await api.get<{ success: boolean; data: BookingResponse[] }>('/bookings');
    return response.data.data;
  }

  // Cancel a booking
  static async cancelBooking(bookingId: string): Promise<void> {
    await api.delete(`/bookings/${bookingId}`);
  }
}

// React Query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  tutorDetails: (tutorId: string) => [...bookingKeys.all, 'tutor', tutorId] as const,
  availableDates: (tutorId: string, month?: string) => [...bookingKeys.all, 'dates', tutorId, month] as const,
  timeSlots: (tutorId: string, date: string) => [...bookingKeys.all, 'slots', tutorId, date] as const,
  userBookings: () => [...bookingKeys.all, 'user'] as const,
}; 