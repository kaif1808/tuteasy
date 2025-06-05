import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../../../ui/Card';
import { cn } from '../../../../utils/cn';
import type { AvailabilityCalendarProps } from '../types';

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availableDates,
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const current = new Date(startDate);

    // Generate 42 days (6 weeks) for complete calendar grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentMonth, currentYear]);

  // Check if a date is available
  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      date.toDateString() === availableDate.toDateString()
    );
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if a date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  // Check if a date is selected
  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  // Check if a date is disabled (before minDate or after maxDate)
  const isDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (date < today || date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Navigation handlers
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Date selection handler
  const handleDateClick = (date: Date) => {
    if (isDisabled(date) || !isDateAvailable(date)) return;
    onDateSelect(date);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            Select Date
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="mx-2 text-sm font-medium min-w-[120px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const disabled = isDisabled(date);
            const available = isDateAvailable(date);
            const selected = isSelected(date);
            const today = isToday(date);
            const currentMonthDate = isCurrentMonth(date);

            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={disabled || !available}
                className={cn(
                  'h-8 w-8 text-xs rounded-md transition-colors',
                  'flex items-center justify-center',
                  {
                    // Base styles
                    'text-gray-900': currentMonthDate,
                    'text-gray-400': !currentMonthDate,
                    
                    // Available dates
                    'hover:bg-blue-50 cursor-pointer': available && !disabled && !selected,
                    'bg-blue-600 text-white hover:bg-blue-700': selected,
                    
                    // Today indicator
                    'ring-2 ring-blue-600 ring-offset-1': today && !selected,
                    
                    // Available but not selected
                    'bg-green-50 text-green-700 border border-green-200': available && !selected && !disabled,
                    
                    // Disabled/unavailable
                    'cursor-not-allowed opacity-50': disabled || !available,
                    'text-gray-300': !available && currentMonthDate,
                  }
                )}
                title={
                  available 
                    ? `Available on ${date.toLocaleDateString()}`
                    : disabled 
                      ? 'Date not available'
                      : 'No slots available'
                }
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-blue-600 rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 