import { Bid } from '../../../../../src/domain/interfaces/Bids/Bid';

describe('Bid', () => {
  describe('validateName', () => {
    it('should not throw error for valid name', () => {
      expect(() => Bid.validateName('Valid Bid Name')).not.toThrow();
    });

    it('should throw error for empty name', () => {
      expect(() => Bid.validateName('')).toThrow('name is required');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => Bid.validateName('   ')).toThrow('name is required');
    });

    it('should throw error for null name', () => {
      expect(() => Bid.validateName(null)).toThrow('name is required');
    });

    it('should throw error for undefined name', () => {
      expect(() => Bid.validateName(undefined as any)).toThrow('name is required');
    });
  });

  describe('validateStatus', () => {
    it('should not throw error for valid status', () => {
      expect(() => Bid.validateStatus('In Process')).not.toThrow();
      expect(() => Bid.validateStatus('Released')).not.toThrow();
      expect(() => Bid.validateStatus('Opened')).not.toThrow();
      expect(() => Bid.validateStatus('Awarded')).not.toThrow();
      expect(() => Bid.validateStatus('Canceled')).not.toThrow();
      expect(() => Bid.validateStatus('Archived')).not.toThrow();
    });

    it('should throw error for invalid status', () => {
      expect(() => Bid.validateStatus('Invalid Status')).toThrow('status must be one of: In Process, Released, Opened, Awarded, Canceled, Archived');
    });

    it('should throw error for empty status', () => {
      expect(() => Bid.validateStatus('')).toThrow('status must be one of: In Process, Released, Opened, Awarded, Canceled, Archived');
    });

    it('should throw error for null status', () => {
      expect(() => Bid.validateStatus(null)).toThrow('status must be one of: In Process, Released, Opened, Awarded, Canceled, Archived');
    });

    it('should throw error for undefined status', () => {
      expect(() => Bid.validateStatus(undefined as any)).toThrow('status must be one of: In Process, Released, Opened, Awarded, Canceled, Archived');
    });
  });

  describe('updateCode', () => {
    it('should update code when valid', () => {
      const bid = new Bid({
        id: 1,
        name: 'Test Bid',
        status: 'In Process',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      bid.updateCode('NEW-CODE');
      expect(bid.code).toBe('NEW-CODE');
    });

    it('should update code to empty string', () => {
      const bid = new Bid({
        id: 1,
        name: 'Test Bid',
        status: 'In Process',
        code: 'OLD-CODE',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      bid.updateCode('');
      expect(bid.code).toBe('');
    });

    it('should throw error when code exceeds 50 characters', () => {
      const bid = new Bid({
        id: 1,
        name: 'Test Bid',
        status: 'In Process',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const longCode = 'A'.repeat(51);
      expect(() => bid.updateCode(longCode)).toThrow('code must not exceed 50 characters');
    });

    it('should not throw error for code with exactly 50 characters', () => {
      const bid = new Bid({
        id: 1,
        name: 'Test Bid',
        status: 'In Process',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const maxCode = 'A'.repeat(50);
      expect(() => bid.updateCode(maxCode)).not.toThrow();
      expect(bid.code).toBe(maxCode);
    });
  });
});
