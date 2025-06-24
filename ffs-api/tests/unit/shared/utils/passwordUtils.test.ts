import { generatePassword, generateVerificationCode } from "../../../../src/shared/utils/generatePasswordAndCode";

describe('generatePassword', () => {
  it('should generate a password of length 15', () => {
    const password = generatePassword();
    expect(password).toHaveLength(15);
  });

  it('should include at least one uppercase, lowercase, digit, and special character', () => {
    const password = generatePassword();

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()\-=+[\]{}|;:,.<>?/]/.test(password);

    expect(hasUppercase).toBe(true);
    expect(hasLowercase).toBe(true);
    expect(hasDigit).toBe(true);
    expect(hasSpecial).toBe(true);
  });

  it('should generate different passwords each time', () => {
    const passwords = new Set(
      Array.from({ length: 5 }, () => generatePassword())
    );
    expect(passwords.size).toBe(5); // all unique
  });
});

describe('generateVerificationCode', () => {
  it('should generate a 6-character alphanumeric code', () => {
    const code = generateVerificationCode();

    expect(code).toHaveLength(6);
    expect(/^[A-Z0-9a-z]{6}$/.test(code)).toBe(true);
  });

  it('should generate different codes each time', () => {
    const codes = new Set(
      Array.from({ length: 5 }, () => generateVerificationCode())
    );
    expect(codes.size).toBe(5); // all unique
  });
});
