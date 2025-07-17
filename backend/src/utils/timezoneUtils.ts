/**
 * Timezone utilities for booking system
 * Handles timezone conversion and validation for international users
 */

export const SUPPORTED_TIMEZONES = [
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Toronto',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland'
] as const;

export type SupportedTimezone = typeof SUPPORTED_TIMEZONES[number];

/**
 * Validate if a timezone string is supported
 */
export function validateTimezone(timezone: string): boolean {
  return SUPPORTED_TIMEZONES.includes(timezone as SupportedTimezone);
}

/**
 * Get the current time in a specific timezone
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  if (!validateTimezone(timezone)) {
    throw new Error(`Unsupported timezone: ${timezone}`);
  }

  return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Convert a date/time to a specific timezone
 */
export function convertToTimezone(date: Date, timezone: string): Date {
  if (!validateTimezone(timezone)) {
    throw new Error(`Unsupported timezone: ${timezone}`);
  }

  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Check if two time ranges overlap
 */
export function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Minutes = timeStringToMinutes(start1);
  const end1Minutes = timeStringToMinutes(end1);
  const start2Minutes = timeStringToMinutes(start2);
  const end2Minutes = timeStringToMinutes(end2);

  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
}

/**
 * Add buffer time to a time slot
 */
export function addBufferTime(
  startTime: string,
  endTime: string,
  bufferMinutes: number
): { bufferedStart: string; bufferedEnd: string } {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);

  const bufferedStart = Math.max(0, startMinutes - bufferMinutes);
  const bufferedEnd = Math.min(24 * 60, endMinutes + bufferMinutes);

  return {
    bufferedStart: minutesToTimeString(bufferedStart),
    bufferedEnd: minutesToTimeString(bufferedEnd)
  };
}

/**
 * Calculate end time given start time and duration
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  return minutesToTimeString(endMinutes);
}

/**
 * Validate that a time is within business hours
 */
export function isWithinBusinessHours(
  time: string,
  businessStart: string = '06:00',
  businessEnd: string = '22:00'
): boolean {
  const timeMinutes = timeStringToMinutes(time);
  const startMinutes = timeStringToMinutes(businessStart);
  const endMinutes = timeStringToMinutes(businessEnd);

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

/**
 * Get timezone offset in hours from UTC
 */
export function getTimezoneOffset(timezone: string): number {
  if (!validateTimezone(timezone)) {
    throw new Error(`Unsupported timezone: ${timezone}`);
  }

  const now = new Date();
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
  
  return (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
}

/**
 * Format date for a specific timezone
 */
export function formatDateForTimezone(
  date: Date,
  timezone: string,
  format: 'date' | 'time' | 'datetime' = 'datetime'
): string {
  if (!validateTimezone(timezone)) {
    throw new Error(`Unsupported timezone: ${timezone}`);
  }

  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    ...(format === 'date' || format === 'datetime' ? {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    } : {}),
    ...(format === 'time' || format === 'datetime' ? {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    } : {})
  };

  return date.toLocaleString('en-GB', options);
}

/**
 * Check if a date/time is in the past relative to a timezone
 */
export function isPastDateTime(
  date: Date,
  time: string,
  timezone: string
): boolean {
  if (!validateTimezone(timezone)) {
    throw new Error(`Unsupported timezone: ${timezone}`);
  }

  const [hours, minutes] = time.split(':').map(Number);
  const targetDateTime = new Date(date);
  targetDateTime.setHours(hours, minutes, 0, 0);

  const now = getCurrentTimeInTimezone(timezone);
  
  return targetDateTime < now;
}

/**
 * Get available timezone options for UI
 */
export function getTimezoneOptions(): Array<{ value: string; label: string; offset: string }> {
  return SUPPORTED_TIMEZONES.map(timezone => {
    const offset = getTimezoneOffset(timezone);
    const offsetString = offset >= 0 ? `+${offset}` : `${offset}`;
    
    return {
      value: timezone,
      label: timezone.replace('_', ' '),
      offset: `UTC${offsetString}`
    };
  });
}
