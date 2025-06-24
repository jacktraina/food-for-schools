import { BadRequestError } from "../../domain/core/errors/BadRequestError";

export function formatDateToYYYYMMDD(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateOnly(input: string): Date {
  if (!input) {
    throw new BadRequestError('Empty date string');
  }

  // Try different formats in order of likelihood or preference
  
  // Format: YYYY-MM-DD (ISO format)
  const isoMatch = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    validateDateComponents(year, month, day);
    return new Date(year, month, day);
  }

  // Format: MM/DD/YYYY (US format)
  const usMatch = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const month = parseInt(usMatch[1], 10) - 1;
    const day = parseInt(usMatch[2], 10);
    const year = parseInt(usMatch[3], 10);
    validateDateComponents(year, month, day);
    return new Date(year, month, day);
  }

  // Format: DD-MM-YYYY (European format)
  const euroMatch = input.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (euroMatch) {
    // This is ambiguous - could be either DD-MM or MM-DD
    // We'll throw an error for ambiguous formats
    throw new BadRequestError(`Ambiguous date format: ${input}. Use YYYY-MM-DD instead.`);
  }

  // Format: YYYY/MM/DD (alternative format)
  const altMatch = input.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (altMatch) {
    const year = parseInt(altMatch[1], 10);
    const month = parseInt(altMatch[2], 10) - 1;
    const day = parseInt(altMatch[3], 10);
    validateDateComponents(year, month, day);
    return new Date(year, month, day);
  }

  // Fallback to Date.parse (less reliable)
  const parsed = new Date(input);
  if (!isNaN(parsed.getTime())) {
    // Validate that the parsed date matches the input to avoid false positives
    const isoString = parsed.toISOString().split('T')[0];
    if (isoString === input || formatDate(parsed, 'MM/DD/YYYY') === input) {
      return parsed;
    }
  }

  throw new BadRequestError(`Unrecognized or invalid date format: ${input}`);
}

function validateDateComponents(year: number, month: number, day: number): void {
  if (year < 1000 || year > 9999) {
    throw new Error(`Invalid year: ${year}`);
  }
  
  if (month < 0 || month > 11) {
    throw new Error(`Invalid month: ${month + 1}`);
  }
  
  const maxDay = new Date(year, month + 1, 0).getDate();
  if (day < 1 || day > maxDay) {
    throw new Error(`Invalid day: ${day} for month ${month + 1}`);
  }
}

// Helper function to format dates for comparison
function formatDate(date: Date, format: string): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  if (format === 'MM/DD/YYYY') {
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
  }
  
  return '';
}

export const getEndOfDay = (date: Date): Date => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

export function formatDateTimeForDatabase(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

export function parseAndStoreExactDateTime(dateStr: string, timeStr: string): string | null {
  // Parse date part (without timezone interpretation)
  const dateParts = dateStr.split(/-|\//); // Handles both YYYY-MM-DD and YYYY/MM/DD
  if (dateParts.length !== 3) return null;
  
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // Months are 0-indexed
  const day = parseInt(dateParts[2], 10);

  // Parse time part
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!timeMatch) return null;

  let hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);
  const ampm = timeMatch[3]?.toUpperCase();

  // Convert 12-hour to 24-hour format if needed
  if (ampm) {
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
  }

  if (minute > 59 || hour > 23 || hour < 0 || minute < 0) return null;

  // Create a Date object (but we'll only use it for validation)
  const testDate = new Date(year, month, day, hour, minute);
  if (isNaN(testDate.getTime())) return null;

  // Format directly as YYYY-MM-DD HH:MM:SS without timezone conversion
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${year}-${pad(month + 1)}-${pad(day)} ${pad(hour)}:${pad(minute)}:00`;
}

/**
 * Gets the current week's start (Monday) and end (Sunday) dates
 * @returns An object with startDate (Monday) and endDate (Sunday) of the current week
 */
export function getCurrentWeekDates(): { startDate: Date; endDate: Date } {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  
  // Calculate Monday (start of week)
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + mondayOffset);
  startDate.setHours(0, 0, 0, 0);
  
  // Calculate Sunday (end of week)
  const sundayOffset = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + sundayOffset);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
}

/**
 * Gets the next week's start (Monday) and end (Sunday) dates
 * @returns An object with startDate (next Monday) and endDate (next Sunday) of the next week
 */
export function getNextWeekDates(): { startDate: Date; endDate: Date } {
  const { startDate: currentMonday } = getCurrentWeekDates();

  // Add 7 days to the current week's Monday and Sunday
  const nextWeekStartDate = new Date(currentMonday);
  nextWeekStartDate.setDate(currentMonday.getDate() + 7);
  nextWeekStartDate.setHours(0, 0, 0, 0);

  const nextWeekEndDate = new Date(nextWeekStartDate);
  nextWeekEndDate.setDate(nextWeekStartDate.getDate() + 6);
  nextWeekEndDate.setHours(23, 59, 59, 999);

  return { startDate: nextWeekStartDate, endDate: nextWeekEndDate };
}

export function isDateInRange(
  date: Date | null | undefined, 
  start: Date, 
  end: Date
): boolean {
  if (!date) return false;
  return date >= start && date <= end;
}

export function spansDateRange(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  rangeStart: Date,
  rangeEnd: Date
): boolean {
  if (!startDate || !endDate) return false;
  return startDate <= rangeStart && endDate >= rangeEnd;
}

export function getMinMaxDates(): { minDate: Date; maxDate: Date } {
  // Earliest practical date (year 1900)
  const minDate = new Date(1900, 0, 1);
  minDate.setHours(0, 0, 0, 0);
  
  // Latest practical date (year 5000)
  const maxDate = new Date(5000, 11, 31);
  maxDate.setHours(23, 59, 59, 999);
  
  return { minDate, maxDate };
}