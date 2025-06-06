import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../hooks/useToast';
import {
  AvailabilityCalendar,
  TimeSlotSelector,
  BookingConfirmationModal,
  type BookingDetails
} from '../components/features/booking';
import { BookingService, bookingKeys, type TutorDetails, type TimeSlot } from '../services/bookingService';

export const BookingPage: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  // State management
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  if (!tutorId) {
    navigate('/find-a-tutor');
    return null;
  }

  // Fetch tutor details
  const {
    data: tutorData,
    isLoading: tutorLoading,
    error: tutorError,
  } = useQuery({
    queryKey: bookingKeys.tutorDetails(tutorId),
    queryFn: () => BookingService.getTutorDetails(tutorId),
    retry: 2,
  });

  // Fetch available dates
  const {
    data: availableDates = [],
    isLoading: datesLoading,
    error: datesError,
  } = useQuery({
    queryKey: bookingKeys.availableDates(tutorId),
    queryFn: () => BookingService.getAvailableDates(tutorId),
    retry: 2,
  });

  // Fetch time slots for selected date
  const {
    data: timeSlots = [],
    isLoading: timeSlotsLoading,
    error: timeSlotsError,
  } = useQuery({
    queryKey: bookingKeys.timeSlots(tutorId, selectedDate?.toISOString().split('T')[0] || ''),
    queryFn: () => BookingService.getAvailableTimeSlots(tutorId, selectedDate!.toISOString().split('T')[0]),
    enabled: !!selectedDate,
    retry: 2,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: BookingService.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.userBookings() });
      showToast({
        title: 'Booking Confirmed!',
        description: 'Your lesson has been successfully booked. You will receive a confirmation email shortly.',
        type: 'success',
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      showToast({
        title: 'Booking Failed',
        description: error.response?.data?.message || 'There was an error processing your booking. Please try again.',
        type: 'error',
      });
    },
  });

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
  }, []);

  // Handle time selection
  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  // Handle booking confirmation
  const handleBookingConfirm = useCallback(async () => {
    if (!selectedDate || !selectedTime || !tutorData) return;

    const bookingRequest = {
      tutorId,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      duration: 60, // 1 hour default
      subject: tutorData.subject,
    };

    createBookingMutation.mutate(bookingRequest);
    setShowConfirmationModal(false);
  }, [selectedDate, selectedTime, tutorData, tutorId, createBookingMutation]);

  // Loading state
  if (tutorLoading || datesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading booking information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (tutorError || datesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Booking Information</h2>
          <p className="text-gray-600 mb-4">
            There was an error loading the tutor's information or availability. Please try again.
          </p>
          <div className="space-x-3">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/find-a-tutor')}>
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!tutorData) {
    return null;
  }

  // Prepare booking details for confirmation modal
  const bookingDetails: BookingDetails = {
    tutorId: tutorId,
    tutorName: tutorData.name,
    date: selectedDate || new Date(),
    time: selectedTime || '09:00',
    duration: 60, // 1 hour
    price: tutorData.hourlyRate,
    subject: tutorData.subject,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <img
                src={tutorData.avatar || '/api/placeholder/64/64'}
                alt={tutorData.name}
                className="w-16 h-16 rounded-full object-cover bg-gray-200"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Book a Lesson with {tutorData.name}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">{tutorData.subject}</Badge>
                  <span className="text-sm text-gray-600">
                    ⭐ {tutorData.rating} ({tutorData.experience} years experience)
                  </span>
                  <span className="text-lg font-semibold text-blue-600">
                    £{tutorData.hourlyRate}/hour
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Steps */}
        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                selectedDate ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
              }`}>
                {selectedDate ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Choose Date</span>
            </div>
            
            <div className="w-8 h-px bg-gray-300"></div>
            
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                selectedTime ? 'bg-green-500 text-white' : selectedDate ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {selectedTime ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Choose Time</span>
            </div>
            
            <div className="w-8 h-px bg-gray-300"></div>
            
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                selectedDate && selectedTime ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Confirm</span>
            </div>
          </div>

          {/* Booking Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <AvailabilityCalendar
                availableDates={availableDates}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                minDate={new Date()}
              />
            </div>

            {/* Time Slots */}
            <div>
              {selectedDate ? (
                <TimeSlotSelector
                  timeSlots={timeSlots.map(slot => slot.time)}
                  selectedTime={selectedTime}
                  onTimeSelect={handleTimeSelect}
                  date={selectedDate}
                  loading={timeSlotsLoading}
                />
              ) : (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      Select a Date First
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        Please select an available date to view time slots
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Continue Button */}
          {selectedDate && selectedTime && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => setShowConfirmationModal(true)}
                size="lg"
                className="px-8"
              >
                Continue to Confirmation
              </Button>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        <BookingConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleBookingConfirm}
          bookingDetails={bookingDetails}
          loading={createBookingMutation.isPending}
        />
      </div>
    </div>
  );
}; 