import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Check } from 'lucide-react';
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

// Mock data - this would come from API calls in real implementation
const mockTutorData = {
  id: 'tutor-123',
  name: 'Dr. Sarah Johnson',
  subject: 'Mathematics',
  rating: 4.9,
  experience: 8,
  hourlyRate: 45,
  avatar: '/api/placeholder/64/64',
};

// Generate mock available dates (next 30 days with some gaps)
const generateMockAvailableDates = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip some days to simulate unavailability
    if (date.getDay() !== 0 && i % 3 !== 0) { // Skip Sundays and every 3rd day
      dates.push(date);
    }
  }
  
  return dates;
};

// Generate mock time slots based on selected date
const generateMockTimeSlots = (date: Date): string[] => {
  const dayOfWeek = date.getDay();
  
  // Different schedules for different days
  if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekdays
    return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  } else if (dayOfWeek === 6) { // Saturday
    return ['10:00', '11:00', '12:00', '14:00', '15:00'];
  } else { // Sunday (shouldn't appear in available dates)
    return [];
  }
};

export const BookingPage: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // State management
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [timeSlotLoading, setTimeSlotLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Mock data
  const availableDates = generateMockAvailableDates();

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
    setTimeSlotLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const slots = generateMockTimeSlots(date);
      setTimeSlots(slots);
      setTimeSlotLoading(false);
    }, 500);
  }, []);

  // Handle time selection
  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  // Handle booking confirmation
  const handleBookingConfirm = useCallback(async () => {
    if (!selectedDate || !selectedTime) return;

    setBookingLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      showToast({
        title: 'Booking Confirmed!',
        description: 'Your lesson has been successfully booked. You will receive a confirmation email shortly.',
        type: 'success',
      });

      // Navigate back or to bookings page
      navigate('/dashboard');
    } catch (error) {
      showToast({
        title: 'Booking Failed',
        description: 'There was an error processing your booking. Please try again.',
        type: 'error',
      });
    } finally {
      setBookingLoading(false);
      setShowConfirmationModal(false);
    }
  }, [selectedDate, selectedTime, navigate, showToast]);

  // Prepare booking details for confirmation modal
  const bookingDetails: BookingDetails = {
    tutorId: tutorId || mockTutorData.id,
    tutorName: mockTutorData.name,
    date: selectedDate || new Date(),
    time: selectedTime || '09:00',
    duration: 60, // 1 hour
    price: mockTutorData.hourlyRate,
    subject: mockTutorData.subject,
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
                src={mockTutorData.avatar}
                alt={mockTutorData.name}
                className="w-16 h-16 rounded-full object-cover bg-gray-200"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Book a Lesson with {mockTutorData.name}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">{mockTutorData.subject}</Badge>
                  <span className="text-sm text-gray-600">
                    ⭐ {mockTutorData.rating} ({mockTutorData.experience} years experience)
                  </span>
                  <span className="text-lg font-semibold text-blue-600">
                    £{mockTutorData.hourlyRate}/hour
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
                  timeSlots={timeSlots}
                  selectedTime={selectedTime}
                  onTimeSelect={handleTimeSelect}
                  date={selectedDate}
                  loading={timeSlotLoading}
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
          loading={bookingLoading}
        />
      </div>
    </div>
  );
}; 