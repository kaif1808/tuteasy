import React from 'react';
import { Calendar, Clock, User, PoundSterling, BookOpen, Loader2 } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import type { BookingConfirmationModalProps } from '../types';

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bookingDetails,
  loading = false,
}) => {
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${period}`;
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  // Calculate end time
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const endTime = calculateEndTime(bookingDetails.time, bookingDetails.duration);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Your Booking"
      maxWidth="lg"
      showCloseButton={!loading}
    >
      <div className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lesson Details
          </h3>
          
          <div className="space-y-3">
            {/* Tutor */}
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-blue-600" />
              <div>
                <span className="text-sm text-gray-600">Tutor:</span>
                <p className="font-medium text-gray-900">{bookingDetails.tutorName}</p>
              </div>
            </div>

            {/* Subject */}
            {bookingDetails.subject && (
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="text-sm text-gray-600">Subject:</span>
                  <Badge variant="secondary" className="ml-2">
                    {bookingDetails.subject}
                  </Badge>
                </div>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <span className="text-sm text-gray-600">Date:</span>
                <p className="font-medium text-gray-900">{formatDate(bookingDetails.date)}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <span className="text-sm text-gray-600">Time:</span>
                <p className="font-medium text-gray-900">
                  {formatTime(bookingDetails.time)} - {formatTime(endTime)}
                  <span className="text-sm text-gray-500 ml-1">
                    ({formatDuration(bookingDetails.duration)})
                  </span>
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <PoundSterling className="h-4 w-4 text-blue-600" />
              <div>
                <span className="text-sm text-gray-600">Price:</span>
                <p className="font-medium text-gray-900 text-lg">
                  £{bookingDetails.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2">Important Information</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Payment will be processed after the lesson is completed</li>
            <li>• You can cancel up to 24 hours before the lesson</li>
            <li>• You'll receive a confirmation email with lesson details</li>
            <li>• The tutor will contact you before the lesson</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 relative"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Confirming...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Confirm Booking
              </>
            )}
          </Button>
        </div>

        {/* Terms Notice */}
        <p className="text-xs text-gray-500 text-center pt-2 border-t">
          By confirming this booking, you agree to TutEasy's{' '}
          <a href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </Modal>
  );
}; 