import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../../../ui/Card';
import { Skeleton } from '../../../ui/Skeleton';
import { cn } from '../../../../utils/cn';
import type { TimeSlotSelectorProps } from '../types';

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  timeSlots,
  selectedTime,
  onTimeSelect,
  date,
  loading = false,
}) => {
  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${period}`;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Group time slots by time period
  const groupTimeSlots = (slots: string[]) => {
    const morning = slots.filter(time => {
      const hour = parseInt(time.split(':')[0]);
      return hour >= 6 && hour < 12;
    });
    
    const afternoon = slots.filter(time => {
      const hour = parseInt(time.split(':')[0]);
      return hour >= 12 && hour < 17;
    });
    
    const evening = slots.filter(time => {
      const hour = parseInt(time.split(':')[0]);
      return hour >= 17 && hour < 22;
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupTimeSlots(timeSlots);

  const renderTimeSlotGroup = (title: string, slots: string[], icon: React.ReactNode) => {
    if (slots.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {icon}
          <span>{title}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {slots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeSelect(time)}
              className={cn(
                'h-10 text-sm font-medium transition-all',
                selectedTime === time
                  ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-200'
                  : 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
              )}
            >
              {formatTime(time)}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderSkeletonGroup = (title: string, count: number, icon: React.ReactNode) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        <span>{title}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-blue-600" />
          Available Times
        </CardTitle>
        <p className="text-sm text-gray-600">
          {formatDate(date)}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-6">
            {renderSkeletonGroup('Morning', 3, <div className="w-4 h-4 bg-gray-300 rounded"></div>)}
            {renderSkeletonGroup('Afternoon', 4, <div className="w-4 h-4 bg-gray-300 rounded"></div>)}
            {renderSkeletonGroup('Evening', 2, <div className="w-4 h-4 bg-gray-300 rounded"></div>)}
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">No time slots available</p>
            <p className="text-sm text-gray-400">
              Please select a different date or check back later
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {renderTimeSlotGroup(
              'Morning',
              morning,
              <div className="w-4 h-4 bg-yellow-200 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
            )}
            
            {renderTimeSlotGroup(
              'Afternoon',
              afternoon,
              <div className="w-4 h-4 bg-orange-200 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              </div>
            )}
            
            {renderTimeSlotGroup(
              'Evening',
              evening,
              <div className="w-4 h-4 bg-purple-200 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
            )}
          </div>
        )}

        {/* Helper text */}
        {!loading && timeSlots.length > 0 && (
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 All times shown are in your local timezone. Each lesson is typically 60 minutes long.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 