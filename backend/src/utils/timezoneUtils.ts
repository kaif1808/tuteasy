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
 * Returns the current moment in time
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  if (!validateTimezone(timezone)) {
    throw new Error(`Unsupported timezone: ${timezone}`);
  }

  // Simply return the current time - the timezone is used for display purposes
  return new Date();
}

/**
 * Convert a date/time to a specific timezone for display purposes
 * Returns the same moment in time (the Date object represents the same instant)
 * Use formatDateForTimezone() to get the string representation in the target timezone
 */
export function convertToTimezone(date: Date, timezone: string): Date {
  if (!validateTimezone(timezone)) {
    throw new Error(`Unsupported timezone: ${timezone}`);
  }

  // Return the same moment in time - timezone conversion is for display only
  // The actual timezone conversion should be handled by formatDateForTimezone()
  return new Date(date.getTime());
}

/**
 * Get timezone offset in hours from UTC for a given timezone at a specific date
 */
export function getTimezoneOffsetAtDate(date: Date, timezone: string): number {
  if (!validateTimezone(timezone)) {
    throw new Error(`Unsupported timezone: ${timezone}`);
  }

  // Get the date in UTC
  const utcDate = new Date(date.getTime());

  // Format the same moment in the target timezone
  const formatter = new Intl.DateTimeFormat('sv-SE', { // sv-SE gives us YYYY-MM-DD HH:mm:ss format
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // Get the formatted time in the target timezone
  const timeInTargetTz = formatter.format(utcDate);

  // Parse it back as if it were UTC to get the offset
  const parsedAsUtc = new Date(timeInTargetTz + 'Z');

  // Calculate offset in hours
  const offsetMs = parsedAsUtc.getTime() - utcDate.getTime();
  return offsetMs / (1000 * 60 * 60);
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
 * Get timezone offset in hours from UTC for a given timezone
 * Uses the current date to account for DST
 */
export function getTimezoneOffset(timezone: string): number {
  if (!validateTimezone(timezone)) {
    throw new Error(`Unsupported timezone: ${timezone}`);
  }

  const now = new Date();
  return getTimezoneOffsetAtDate(now, timezone);
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

  // Use Intl.DateTimeFormat for consistent formatting
  return new Intl.DateTimeFormat('en-GB', options).format(date);
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

  // Create the target datetime in UTC
  const targetDateTime = new Date(date);
  targetDateTime.setUTCHours(hours, minutes, 0, 0);

  // Get current time
  const now = new Date();

  // Get the timezone offset to adjust the comparison
  const offset = getTimezoneOffsetAtDate(targetDateTime, timezone);
  const adjustedTargetTime = new Date(targetDateTime.getTime() - (offset * 60 * 60 * 1000));

  return adjustedTargetTime < now;
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
