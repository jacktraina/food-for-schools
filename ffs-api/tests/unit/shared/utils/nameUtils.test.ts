import { getInitials } from "../../../../src/shared/utils/nameUtils";

describe('getInitials', () => {
  beforeEach(() => {
    // Mock console.log to verify it's being called correctly
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore the original console.log after each test
    (console.log as jest.Mock).mockRestore();
  });

  it('should return all initials when all names are provided', () => {
    const result = getInitials('John', 'Doe', 'Smith');
    expect(result).toBe('JDS');
    expect(console.log).toHaveBeenCalledWith('reutrning initial sJDS');
  });

  it('should return initials without middle name when middleName is null', () => {
    const result = getInitials('John', null, 'Smith');
    expect(result).toBe('JS');
    expect(console.log).toHaveBeenCalledWith('reutrning initial sJS');
  });

  it('should return initials without middle name when middleName is empty string', () => {
    const result = getInitials('John', '', 'Smith');
    expect(result).toBe('JS');
  });

  it('should handle empty firstName', () => {
    const result = getInitials('', 'Doe', 'Smith');
    expect(result).toBe('DS');
  });

  it('should handle empty lastName', () => {
    const result = getInitials('John', 'Doe', '');
    expect(result).toBe('JD');
  });

  it('should return empty string when all names are empty', () => {
    const result = getInitials('', null, '');
    expect(result).toBe('');
    expect(console.log).toHaveBeenCalledWith('reutrning initial s');
  });

  it('should handle single character names', () => {
    const result = getInitials('J', 'D', 'S');
    expect(result).toBe('JDS');
  });

  it('should handle names with leading/trailing spaces', () => {
    const result = getInitials(' John ', '  Doe  ', ' Smith ');
    expect(result).toBe('JDS');
  });

  it('should handle unicode characters', () => {
    const result = getInitials('Jöhn', 'Dœ', 'Smîth');
    expect(result).toBe('JDS');
  });

  it('should log the correct output to console', () => {
    getInitials('A', 'B', 'C');
    expect(console.log).toHaveBeenCalledWith('reutrning initial sABC');
  });
});