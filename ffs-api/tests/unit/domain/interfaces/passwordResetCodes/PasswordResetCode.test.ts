import { PasswordResetCode } from '../../../../../src/domain/interfaces/passwordResetCodes/PasswordResetCode';

describe('PasswordResetCode', () => {
  describe('constructor', () => {
    it('should create PasswordResetCode with all properties', () => {
      const expiresAt = new Date(Date.now() + 3600000);
      const createdAt = new Date();
      
      const resetCode = new PasswordResetCode({
        id: 1,
        userId: 123,
        code: 'ABC123',
        expiresAt,
        used: false,
        createdAt
      });

      expect(resetCode.id).toBe(1);
      expect(resetCode.userId).toBe(123);
      expect(resetCode.code).toBe('ABC123');
      expect(resetCode.expiresAt).toBe(expiresAt);
      expect(resetCode.used).toBe(false);
      expect(resetCode.createdAt).toBe(createdAt);
    });

    it('should use default values for optional properties', () => {
      const expiresAt = new Date(Date.now() + 3600000);
      
      const resetCode = new PasswordResetCode({
        id: 1,
        userId: 123,
        code: 'ABC123',
        expiresAt,
        used: true,
        createdAt: new Date()
      });

      expect(resetCode.used).toBe(true);
    });
  });

  describe('create static method', () => {
    it('should create new PasswordResetCode with generated code', () => {
      const userId = 123;
      const resetCode = PasswordResetCode.create(userId);

      expect(resetCode.userId).toBe(userId);
      expect(resetCode.code).toBeDefined();
      expect(resetCode.code.length).toBeGreaterThan(0);
      expect(resetCode.used).toBe(false);
      expect(resetCode.id).toBe(-1);
      expect(resetCode.expiresAt).toBeInstanceOf(Date);
      expect(resetCode.createdAt).toBeInstanceOf(Date);
    });

    it('should create code that expires in the future', () => {
      const resetCode = PasswordResetCode.create(123);
      const now = new Date();
      
      expect(resetCode.expiresAt.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('isExpired', () => {
    it('should return false when code has not expired', () => {
      const futureDate = new Date(Date.now() + 3600000);
      const resetCode = new PasswordResetCode({
        id: 1,
        userId: 123,
        code: 'ABC123',
        expiresAt: futureDate,
        used: false,
        createdAt: new Date()
      });

      expect(resetCode.isExpired()).toBe(false);
    });

    it('should return true when code has expired', () => {
      const pastDate = new Date(Date.now() - 3600000);
      const resetCode = new PasswordResetCode({
        id: 1,
        userId: 123,
        code: 'ABC123',
        expiresAt: pastDate,
        used: false,
        createdAt: new Date()
      });

      expect(resetCode.isExpired()).toBe(true);
    });

    it('should return true when expiration date is exactly now', () => {
      const now = new Date();
      const resetCode = new PasswordResetCode({
        id: 1,
        userId: 123,
        code: 'ABC123',
        expiresAt: now,
        used: false,
        createdAt: new Date()
      });

      expect(resetCode.isExpired()).toBe(false);
    });
  });

  describe('isValid', () => {
    it('should return true when code is not expired and not used', () => {
      const futureDate = new Date(Date.now() + 3600000);
      const resetCode = new PasswordResetCode({
        id: 1,
        userId: 123,
        code: 'ABC123',
        expiresAt: futureDate,
        used: false,
        createdAt: new Date()
      });

      expect(resetCode.isValid()).toBe(true);
    });

    it('should return false when code is expired', () => {
      const pastDate = new Date(Date.now() - 3600000);
      const resetCode = new PasswordResetCode({
        id: 1,
        userId: 123,
        code: 'ABC123',
        expiresAt: pastDate,
        used: false,
        createdAt: new Date()
      });

      expect(resetCode.isValid()).toBe(false);
    });

    it('should return false when code is used', () => {
      const futureDate = new Date(Date.now() + 3600000);
      const resetCode = new PasswordResetCode({
        id: 1,
        userId: 123,
        code: 'ABC123',
        expiresAt: futureDate,
        used: true,
        createdAt: new Date()
      });

      expect(resetCode.isValid()).toBe(false);
    });

    it('should return false when code is both expired and used', () => {
      const pastDate = new Date(Date.now() - 3600000);
      const resetCode = new PasswordResetCode({
        id: 1,
        userId: 123,
        code: 'ABC123',
        expiresAt: pastDate,
        used: true,
        createdAt: new Date()
      });

      expect(resetCode.isValid()).toBe(false);
    });
  });

  describe('markAsUsed', () => {
    it('should mark code as used', () => {
      const resetCode = new PasswordResetCode({
        id: 1,
        userId: 123,
        code: 'ABC123',
        expiresAt: new Date(Date.now() + 3600000),
        used: false,
        createdAt: new Date()
      });

      expect(resetCode.used).toBe(false);
      resetCode.markAsUsed();
      expect(resetCode.used).toBe(true);
    });

    it('should make valid code invalid after marking as used', () => {
      const resetCode = new PasswordResetCode({
        id: 1,
        userId: 123,
        code: 'ABC123',
        expiresAt: new Date(Date.now() + 3600000),
        used: false,
        createdAt: new Date()
      });

      expect(resetCode.isValid()).toBe(true);
      resetCode.markAsUsed();
      expect(resetCode.isValid()).toBe(false);
    });
  });
});
