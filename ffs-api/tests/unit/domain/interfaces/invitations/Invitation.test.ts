import { Invitation } from '../../../../../src/domain/interfaces/invitations/Invitation';

describe('Invitation', () => {
  describe('constructor', () => {
    it('should create Invitation with valid properties', () => {
      const invitation = new Invitation({
        id: 1,
        email: 'test@example.com',
        invitedBy: 1,
        statusId: 1,
        createdAt: new Date('2023-01-01')
      });

      expect(invitation.id).toBe(1);
      expect(invitation.email).toBe('test@example.com');
      expect(invitation.invitedBy).toBe(1);
      expect(invitation.statusId).toBe(1);
    });

    it('should validate email during construction', () => {
      expect(() => new Invitation({
        id: 1,
        email: '',
        invitedBy: 1,
        statusId: 1,
        createdAt: new Date()
      })).toThrow('email is required and cannot be empty');
    });

    it('should validate invitedBy during construction', () => {
      expect(() => new Invitation({
        id: 1,
        email: 'test@example.com',
        invitedBy: 0,
        statusId: 1,
        createdAt: new Date()
      })).toThrow('invitedBy must be a positive integer');
    });

    it('should validate statusId during construction', () => {
      expect(() => new Invitation({
        id: 1,
        email: 'test@example.com',
        invitedBy: 1,
        statusId: 0,
        createdAt: new Date()
      })).toThrow('statusId must be a positive integer');
    });
  });

  describe('validateEmail', () => {
    it('should not throw error for valid email', () => {
      expect(() => Invitation.validateEmail('test@example.com')).not.toThrow();
    });

    it('should throw error for empty email', () => {
      expect(() => Invitation.validateEmail('')).toThrow('email is required and cannot be empty');
    });

    it('should throw error for whitespace-only email', () => {
      expect(() => Invitation.validateEmail('   ')).toThrow('email is required and cannot be empty');
    });

    it('should throw error for null email', () => {
      expect(() => Invitation.validateEmail(null as any)).toThrow('email is required and cannot be empty');
    });

    it('should throw error for undefined email', () => {
      expect(() => Invitation.validateEmail(undefined as any)).toThrow('email is required and cannot be empty');
    });

    it('should throw error for invalid email format', () => {
      expect(() => Invitation.validateEmail('invalid-email')).toThrow('email must be a valid email address');
    });

    it('should throw error for email without domain', () => {
      expect(() => Invitation.validateEmail('test@')).toThrow('email must be a valid email address');
    });

    it('should throw error for email without @', () => {
      expect(() => Invitation.validateEmail('testexample.com')).toThrow('email must be a valid email address');
    });
  });

  describe('validateInvitedBy', () => {
    it('should not throw error for valid positive integer invitedBy', () => {
      expect(() => Invitation.validateInvitedBy(1)).not.toThrow();
      expect(() => Invitation.validateInvitedBy(100)).not.toThrow();
    });

    it('should throw error for zero invitedBy', () => {
      expect(() => Invitation.validateInvitedBy(0)).toThrow('invitedBy must be a positive integer');
    });

    it('should throw error for negative invitedBy', () => {
      expect(() => Invitation.validateInvitedBy(-1)).toThrow('invitedBy must be a positive integer');
    });

    it('should throw error for non-integer invitedBy', () => {
      expect(() => Invitation.validateInvitedBy(1.5)).toThrow('invitedBy must be a positive integer');
    });

    it('should throw error for NaN invitedBy', () => {
      expect(() => Invitation.validateInvitedBy(NaN)).toThrow('invitedBy must be a positive integer');
    });
  });

  describe('validateStatusId', () => {
    it('should not throw error for valid positive integer statusId', () => {
      expect(() => Invitation.validateStatusId(1)).not.toThrow();
      expect(() => Invitation.validateStatusId(100)).not.toThrow();
    });

    it('should throw error for zero statusId', () => {
      expect(() => Invitation.validateStatusId(0)).toThrow('statusId must be a positive integer');
    });

    it('should throw error for negative statusId', () => {
      expect(() => Invitation.validateStatusId(-1)).toThrow('statusId must be a positive integer');
    });

    it('should throw error for non-integer statusId', () => {
      expect(() => Invitation.validateStatusId(1.5)).toThrow('statusId must be a positive integer');
    });

    it('should throw error for NaN statusId', () => {
      expect(() => Invitation.validateStatusId(NaN)).toThrow('statusId must be a positive integer');
    });
  });

  describe('isExpired', () => {
    it('should return false when expirationDate is null', () => {
      const invitation = new Invitation({
        id: 1,
        email: 'test@example.com',
        invitedBy: 1,
        statusId: 1,
        expirationDate: null,
        createdAt: new Date()
      });

      expect(invitation.isExpired()).toBe(false);
    });

    it('should return false when expirationDate is undefined', () => {
      const invitation = new Invitation({
        id: 1,
        email: 'test@example.com',
        invitedBy: 1,
        statusId: 1,
        createdAt: new Date()
      });

      expect(invitation.isExpired()).toBe(false);
    });

    it('should return true when expirationDate is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const invitation = new Invitation({
        id: 1,
        email: 'test@example.com',
        invitedBy: 1,
        statusId: 1,
        expirationDate: pastDate,
        createdAt: new Date()
      });

      expect(invitation.isExpired()).toBe(true);
    });

    it('should return false when expirationDate is in the future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invitation = new Invitation({
        id: 1,
        email: 'test@example.com',
        invitedBy: 1,
        statusId: 1,
        expirationDate: futureDate,
        createdAt: new Date()
      });

      expect(invitation.isExpired()).toBe(false);
    });
  });
});
