import { config } from "../../../../../src/config/env";
import { EmailVerificationCode } from "../../../../../src/domain/interfaces/emailVerificationCodes/EmailVerificationCode";

// Mock the config and generateVerificationCode for testing
jest.mock('../../../../../src/config/env', () => ({
  config: {
    verificationCodeExpiration: 3600000, // 1 hour in ms
  },
}));

jest.mock('../../../../../src/shared/utils/generatePasswordAndCode', () => ({
  generateVerificationCode: jest.fn(() => '123456'),
}));

describe('EmailVerificationCode', () => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + 10000); // 10 seconds in future
  const pastDate = new Date(now.getTime() - 10000); // 10 seconds in past

  describe('constructor', () => {
    it('should create an instance with provided values', () => {
      const props = {
        id: 1,
        userId: 100,
        code: '654321',
        expiresAt: futureDate,
        used: false,
        createdAt: now,
        isDeleted: false,
      };

      const verificationCode = new EmailVerificationCode(props);

      expect(verificationCode.id).toBe(1);
      expect(verificationCode.userId).toBe(100);
      expect(verificationCode.code).toBe('654321');
      expect(verificationCode.expiresAt).toEqual(futureDate);
      expect(verificationCode.used).toBe(false);
      expect(verificationCode.createdAt).toEqual(now);
      expect(verificationCode.isDeleted).toBe(false);
    });

    it('should set default values when optional properties are not provided', () => {
      const props = {
        id: 1,
        userId: 100,
        code: '654321',
        expiresAt: futureDate,
      };

      const verificationCode = new EmailVerificationCode(props as any);

      expect(verificationCode.used).toBe(false);
      expect(verificationCode.createdAt).toBeInstanceOf(Date);
      expect(verificationCode.isDeleted).toBe(false);
    });

    it('should accept custom values for optional properties', () => {
      const props = {
        id: 1,
        userId: 100,
        code: '654321',
        expiresAt: futureDate,
        used: true,
        createdAt: pastDate,
        isDeleted: true,
      };

      const verificationCode = new EmailVerificationCode(props);

      expect(verificationCode.used).toBe(true);
      expect(verificationCode.createdAt).toEqual(pastDate);
      expect(verificationCode.isDeleted).toBe(true);
    });
  });

  describe('create static method', () => {
    it('should create a new verification code with generated values', () => {
      const userId = 100;
      const verificationCode = EmailVerificationCode.create(userId);

      expect(verificationCode.id).toBe(-1);
      expect(verificationCode.userId).toBe(userId);
      expect(verificationCode.code).toBe('123456'); // Mocked value
      expect(verificationCode.expiresAt.getTime()).toBeGreaterThan(now.getTime());
      expect(verificationCode.used).toBe(false);
      expect(verificationCode.createdAt).toBeInstanceOf(Date);
      expect(verificationCode.isDeleted).toBe(false);
    });

    it('should set expiration time based on config', () => {
      const userId = 100;
      const verificationCode = EmailVerificationCode.create(userId);

      const expectedExpiration = new Date(
        verificationCode.createdAt.getTime() + config.verificationCodeExpiration
      );

      // Allow for slight time differences due to test execution
      expect(verificationCode.expiresAt.getTime()).toBeCloseTo(
        expectedExpiration.getTime(),
        -2 // Precision to 10ms
      );
    });

    it('should always generate a 6-digit code', () => {
      const userId = 100;
      const verificationCode = EmailVerificationCode.create(userId);

      expect(verificationCode.code).toHaveLength(6);
      expect(verificationCode.code).toMatch(/^\d{6}$/); // Only digits
    });
  });

  describe('isExpired method', () => {
    it('should return true when expiration date is in the past', () => {
      const props = {
        id: 1,
        userId: 100,
        code: '654321',
        expiresAt: pastDate,
        used: false,
        isDeleted: false,
        createdAt: now,
      };

      const verificationCode = new EmailVerificationCode(props);
      expect(verificationCode.isExpired()).toBe(true);
    });

    it('should return false when expiration date is in the future', () => {
      const props = {
        id: 1,
        userId: 100,
        code: '654321',
        expiresAt: futureDate,
        used: false,
        isDeleted: false,
        createdAt: now,
      };

      const verificationCode = new EmailVerificationCode(props);
      expect(verificationCode.isExpired()).toBe(false);
    });

    it('should return true when expiration date is exactly now', () => {
      const props = {
        id: 1,
        userId: 100,
        code: '654321',
        expiresAt: now,
        used: false,
        isDeleted: false,
        createdAt: now,
      };

      const verificationCode = new EmailVerificationCode(props);
      expect(verificationCode.isExpired()).toBe(true);
    });
  });

  describe('isValid method', () => {
    it('should return true for a valid, unused, non-expired, non-deleted code', () => {
      const props = {
        id: 1,
        userId: 100,
        code: '654321',
        expiresAt: futureDate,
        used: false,
        isDeleted: false,
        createdAt: now,
      };

      const verificationCode = new EmailVerificationCode(props);
      expect(verificationCode.isValid()).toBe(true);
    });

    it('should return false when code is expired', () => {
      const props = {
        id: 1,
        userId: 100,
        code: '654321',
        expiresAt: pastDate,
        used: false,
        isDeleted: false,
        createdAt: now,
      };

      const verificationCode = new EmailVerificationCode(props);
      expect(verificationCode.isValid()).toBe(false);
    });

    it('should return false when code is used', () => {
      const props = {
        id: 1,
        userId: 100,
        code: '654321',
        expiresAt: futureDate,
        used: true,
        isDeleted: false,
        createdAt: now,
      };

      const verificationCode = new EmailVerificationCode(props);
      expect(verificationCode.isValid()).toBe(false);
    });

    it('should return false when code is deleted', () => {
      const props = {
        id: 1,
        userId: 100,
        code: '654321',
        expiresAt: futureDate,
        used: false,
        isDeleted: true,
        createdAt: now,
      };

      const verificationCode = new EmailVerificationCode(props);
      expect(verificationCode.isValid()).toBe(false);
    });

    it('should return false when code is expired, used, and deleted', () => {
      const props = {
        id: 1,
        userId: 100,
        code: '654321',
        expiresAt: pastDate,
        used: true,
        isDeleted: true,
        createdAt: now,
      };

      const verificationCode = new EmailVerificationCode(props);
      expect(verificationCode.isValid()).toBe(false);
    });
  });
});