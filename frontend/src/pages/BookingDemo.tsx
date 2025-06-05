import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import {
  AvailabilityCalendar,
  TimeSlotSelector,
  BookingConfirmationModal,
  type BookingDetails
} from '../components/features/booking';

// Mock data for demo
const mockAvailableDates = [
  new Date(2024, 11, 15), // December 15, 2024
  new Date(2024, 11, 16), // December 16, 2024
  new Date(2024, 11, 18), // December 18, 2024
  new Date(2024, 11, 20), // December 20, 2024
  new Date(2024, 11, 22), // December 22, 2024
  new Date(2024, 11, 23), // December 23, 2024
];

const mockTimeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

const mockBookingDetails: BookingDetails = {
  tutorId: 'demo-tutor',
  tutorName: 'Dr. Sarah Johnson',
  date: new Date(2024, 11, 15),
  time: '10:00',
  duration: 60,
  price: 45,
  subject: 'Mathematics',
};

export const BookingDemo: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [timeSlotLoading, setTimeSlotLoading] = useState(false);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
    
    // Simulate loading
    setTimeSlotLoading(true);
    setTimeout(() => {
      setTimeSlotLoading(false);
    }, 1000);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookingConfirm = () => {
    alert('Booking confirmed! (Demo mode)');
    setShowModal(false);
  };

  const updatedBookingDetails = {
    ...mockBookingDetails,
    date: selectedDate || mockBookingDetails.date,
    time: selectedTime || mockBookingDetails.time,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking System Components Demo
            </h1>
            <p className="text-gray-600">
              Interactive demonstration of the lesson booking system components
            </p>
          </div>
        </div>

        {/* Component Showcase */}
        <div className="space-y-12">
          {/* Calendar Component */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Availability Calendar
            </h2>
            <p className="text-gray-600 mb-6">
              Interactive calendar showing available dates with navigation and selection
            </p>
            <div className="flex justify-center">
              <AvailabilityCalendar
                availableDates={mockAvailableDates}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                minDate={new Date()}
              />
            </div>
          </section>

          {/* Time Slot Selector */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Time Slot Selector
            </h2>
            <p className="text-gray-600 mb-6">
              Time slot selection with morning, afternoon, and evening groupings
            </p>
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <TimeSlotSelector
                  timeSlots={selectedDate ? mockTimeSlots : []}
                  selectedTime={selectedTime}
                  onTimeSelect={handleTimeSelect}
                  date={selectedDate || new Date()}
                  loading={timeSlotLoading}
                />
              </div>
            </div>
          </section>

          {/* Modal Demo */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Booking Confirmation Modal
            </h2>
            <p className="text-gray-600 mb-6">
              Comprehensive booking summary with confirmation actions
            </p>
            <div className="text-center">
              <Button onClick={() => setShowModal(true)}>
                Show Confirmation Modal
              </Button>
            </div>
          </section>

          {/* Current Selection Summary */}
          {(selectedDate || selectedTime) && (
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Selection
              </h3>
              <div className="space-y-2 text-sm">
                {selectedDate && (
                  <p>
                    <span className="font-medium">Selected Date:</span>{' '}
                    {selectedDate.toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
                {selectedTime && (
                  <p>
                    <span className="font-medium">Selected Time:</span> {selectedTime}
                  </p>
                )}
                {selectedDate && selectedTime && (
                  <div className="pt-2">
                    <Button
                      onClick={() => setShowModal(true)}
                      size="sm"
                    >
                      Proceed to Confirmation
                    </Button>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Booking Confirmation Modal */}
        <BookingConfirmationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleBookingConfirm}
          bookingDetails={updatedBookingDetails}
          loading={false}
        />
      </div>
    </div>
  );
}; 