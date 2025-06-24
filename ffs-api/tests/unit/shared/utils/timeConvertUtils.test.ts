import { formatDateTimeForDatabase, formatDateToYYYYMMDD, getCurrentWeekDates, getMinMaxDates, parseAndStoreExactDateTime, parseDateOnly } from "../../../../src/shared/utils/timeConvertUtils";


describe('formatDateToYYYYMMDD', () => {
  it('formats a Date to YYYY-MM-DD', () => {
    const date = new Date('2024-04-17');
    expect(formatDateToYYYYMMDD(date)).toBe('2024-04-17');
  });

  it('pads month and day with zeros', () => {
    const date = new Date('2024-01-05');
    expect(formatDateToYYYYMMDD(date)).toBe('2024-01-05');
  });
});

describe('formatDateTimeForDatabase', () => {
  it('formats a Date to YYYY-MM-DDTHH:MM:SSZ', () => {
    const date = new Date(2024, 3, 17, 14, 30, 45); // Local time, NOT UTC
    expect(formatDateTimeForDatabase(date)).toBe('2024-04-17T14:30:45Z');
  });


  it('pads components correctly', () => {
    const date = new Date(2024, 0, 5, 4, 7, 9); // Jan 5, 04:07:09 UTC
    expect(formatDateTimeForDatabase(date)).toBe('2024-01-05T04:07:09Z');
  });
});

describe('parseAndStoreExactDateTime', () => {
  it('parses and combines date and time in 24-hour format', () => {
    const result = parseAndStoreExactDateTime('2024-04-17', '3:45 PM');
    expect(result).toBe('2024-04-17 15:45:00');
  });

  it('parses AM time correctly', () => {
    const result = parseAndStoreExactDateTime('2024-04-17', '12:15 AM');
    expect(result).toBe('2024-04-17 00:15:00');
  });

  it('parses 24-hour time format', () => {
    const result = parseAndStoreExactDateTime('2024-04-17', '23:59');
    expect(result).toBe('2024-04-17 23:59:00');
  });

  it('returns null for invalid date format', () => {
    const result = parseAndStoreExactDateTime('invalid-date', '12:00 PM');
    expect(result).toBeNull();
  });

  it('returns null for invalid time format', () => {
    const result = parseAndStoreExactDateTime('2024-04-17', '99:99');
    expect(result).toBeNull();
  });

  it('handles slashes in date string', () => {
    const result = parseAndStoreExactDateTime('2024/04/17', '1:00 PM');
    expect(result).toBe('2024-04-17 13:00:00');
  });
});

describe('parseDateOnly', () => {
  it('should parse a date in YYYY-MM-DD format', () => {
    const date = parseDateOnly('2023-10-26');
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(9); // Month is 0-indexed
    expect(date.getDate()).toBe(26);
  });

  it('should parse a date in MM/DD/YYYY format', () => {
    const date = parseDateOnly('10/26/2023');
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(9);
    expect(date.getDate()).toBe(26);
  });

  it('should parse a date in YYYY/MM/DD format', () => {
    const date = parseDateOnly('2024/01/15');
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(15);
  });

  it('should throw an error for an empty input string', () => {
    expect(() => parseDateOnly('')).toThrow('Empty date string');
  });

  it('should throw an error for an ambiguous DD-MM-YYYY format', () => {
    expect(() => parseDateOnly('26-10-2023')).toThrow('Ambiguous date format: 26-10-2023. Use YYYY-MM-DD instead.');
  });

  it('should throw an error for an invalid year', () => {
    expect(() => parseDateOnly('999-10-26')).toThrow('Unrecognized or invalid date format: 999-10-26');
    expect(() => parseDateOnly('10000-10-26')).toThrow('Unrecognized or invalid date format: 10000-10-26');
  });

  it('should throw an error for an invalid month', () => {
    expect(() => parseDateOnly('2023-13-26')).toThrow('Invalid month: 13');
    expect(() => parseDateOnly('2023-00-26')).toThrow('Invalid month: 0');
  });

  it('should throw an error for an invalid day', () => {
    expect(() => parseDateOnly('2023-10-32')).toThrow('Invalid day: 32 for month 10');
    expect(() => parseDateOnly('2023-02-29')).toThrow('Invalid day: 29 for month 2'); // Non-leap year
    expect(() => parseDateOnly('2024-02-30')).toThrow('Invalid day: 30 for month 2'); // Leap year
    expect(() => parseDateOnly('2023-04-0')).toThrow('Invalid day: 0 for month 4');
  });

  it('should parse a valid date using Date.parse when other formats fail (YYYY-MM-DD)', () => {
    const date = parseDateOnly('2025-05-10');
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(4);
    expect(date.getDate()).toBe(10);
  });

  it('should parse a valid date using Date.parse when other formats fail (MM/DD/YYYY)', () => {
    const date = parseDateOnly('03/15/2026');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(15);
  });

  it('should throw an error if Date.parse returns an invalid date', () => {
    expect(() => parseDateOnly('invalid-date')).toThrow('Unrecognized or invalid date format: invalid-date');
  });

  it('should throw an error if Date.parse parses a date but it does not match the input (different order)', () => {
    expect(() => parseDateOnly('10-11-2023')).toThrow('Ambiguous date format: 10-11-2023. Use YYYY-MM-DD instead.');
  });

  it('should handle single digit month and day in MM/DD/YYYY format', () => {
    const date = parseDateOnly('1/5/2024');
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(5);
  });

  it('should handle single digit month and day in YYYY/MM/DD format', () => {
    const date = parseDateOnly('2025/3/9');
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(9);
  });
});

describe('getCurrentWeekDates', () => {
  beforeAll(() => {
    // Force UTC timezone for all tests
    process.env.TZ = 'UTC';
  });
  // Save original Date object to restore later
  const OriginalDate = Date;

  afterEach(() => {
    // Reset the Date object after each test
    global.Date = OriginalDate;
    jest.restoreAllMocks();
  });

  function mockDate(isoDate: string) {
    const mockDate = new Date(isoDate);
    (global as any).Date = jest.fn(() => mockDate);
    (global as any).Date.UTC = OriginalDate.UTC;
    (global as any).Date.now = OriginalDate.now;
    (global as any).Date.parse = OriginalDate.parse;
    return mockDate;
  }

  it('should return correct dates when today is Monday', () => {
    // Mock Monday, June 3, 2024
    const mockToday = mockDate('2024-06-03T12:00:00Z');

    const result = getCurrentWeekDates();

    expect(result.startDate).toEqual(new Date('2024-06-03T00:00:00.000Z'));
    expect(result.endDate).toEqual(new Date('2024-06-09T23:59:59.999Z'));
  });

  it('should return correct dates when today is Wednesday', () => {
    // Mock Wednesday, June 5, 2024
    const mockToday = mockDate('2024-06-05T12:00:00Z');

    const result = getCurrentWeekDates();

    expect(result.startDate).toEqual(new Date('2024-06-03T00:00:00.000Z'));
    expect(result.endDate).toEqual(new Date('2024-06-09T23:59:59.999Z'));
  });

  it('should return correct dates when today is Sunday', () => {
    // Mock Sunday, June 9, 2024
    const mockToday = mockDate('2024-06-09T12:00:00Z');

    const result = getCurrentWeekDates();

    expect(result.startDate).toEqual(new Date('2024-06-03T00:00:00.000Z'));
    expect(result.endDate).toEqual(new Date('2024-06-09T23:59:59.999Z'));
  });

  it('should handle month transition correctly (end of month)', () => {
    // Mock Wednesday, May 29, 2024 (week crosses into June)
    const mockToday = mockDate('2024-05-29T12:00:00Z');

    const result = getCurrentWeekDates();

    expect(result.startDate).toEqual(new Date('2024-05-27T00:00:00.000Z'));
    expect(result.endDate).toEqual(new Date('2024-06-02T23:59:59.999Z'));
  });

  it('should handle month transition correctly (start of month)', () => {
    // Mock Monday, July 1, 2024 (previous days in June)
    const mockToday = mockDate('2024-07-01T12:00:00Z');

    const result = getCurrentWeekDates();

    expect(result.startDate).toEqual(new Date('2024-07-01T00:00:00.000Z'));
    expect(result.endDate).toEqual(new Date('2024-07-07T23:59:59.999Z'));
  });

  it('should handle year transition correctly', () => {
    // Mock Tuesday, December 31, 2024 (week crosses into 2025)
    const mockToday = mockDate('2024-12-31T12:00:00Z');

    const result = getCurrentWeekDates();

    expect(result.startDate).toEqual(new Date('2024-12-30T00:00:00.000Z'));
    expect(result.endDate).toEqual(new Date('2025-01-05T23:59:59.999Z'));
  });

  // TODO fix the broken test
  // it('should set correct time for start and end dates', () => {
  //   // Mock Friday, June 7, 2024 at 12:34:56 UTC
  //   const mockToday = mockDate('2024-06-07T12:34:56.000Z');

  //   const result = getCurrentWeekDates();

  //   // Verify start date (Monday of same week)
  //   expect(result.startDate.toISOString()).toBe('2024-06-03T00:00:00.000Z');

  //   // Verify end date (Sunday of same week)
  //   expect(result.endDate.toISOString()).toBe('2024-06-09T23:59:59.999Z');
  // });
});

describe('getMinMaxDates', () => {
  it('should return an object with minDate and maxDate properties', () => {
    const result = getMinMaxDates();
    expect(result).toHaveProperty('minDate');
    expect(result).toHaveProperty('maxDate');
  });

  it('should return a minDate set to January 1, 1900, at the beginning of the day', () => {
    const { minDate } = getMinMaxDates();
    expect(minDate).toBeInstanceOf(Date);
    expect(minDate.getFullYear()).toBe(1900);
    expect(minDate.getMonth()).toBe(0); // January is month 0
    expect(minDate.getDate()).toBe(1);
    expect(minDate.getHours()).toBe(0);
    expect(minDate.getMinutes()).toBe(0);
    expect(minDate.getSeconds()).toBe(0);
    expect(minDate.getMilliseconds()).toBe(0);
  });

  it('should return a maxDate set to December 31, 5000, at the end of the day', () => {
    const { maxDate } = getMinMaxDates();
    expect(maxDate).toBeInstanceOf(Date);
    expect(maxDate.getFullYear()).toBe(5000);
    expect(maxDate.getMonth()).toBe(11); // December is month 11
    expect(maxDate.getDate()).toBe(31);
    expect(maxDate.getHours()).toBe(23);
    expect(maxDate.getMinutes()).toBe(59);
    expect(maxDate.getSeconds()).toBe(59);
    expect(maxDate.getMilliseconds()).toBe(999);
  });

  it('should ensure minDate is chronologically before maxDate', () => {
    const { minDate, maxDate } = getMinMaxDates();
    expect(minDate.getTime()).toBeLessThan(maxDate.getTime());
  });
});