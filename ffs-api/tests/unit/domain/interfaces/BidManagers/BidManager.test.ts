import { BidManager } from '../../../../../src/domain/interfaces/BidManagers/BidManager';

describe('BidManager', () => {
  describe('constructor', () => {
    it('should create BidManager with valid properties', () => {
      const bidManager = new BidManager({
        id: 1,
        userId: 1,
        bidId: 1,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      });

      expect(bidManager.id).toBe(1);
      expect(bidManager.userId).toBe(1);
      expect(bidManager.bidId).toBe(1);
    });

    it('should validate userId during construction', () => {
      expect(() => new BidManager({
        id: 1,
        userId: 0,
        bidId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })).toThrow('userId must be a positive integer');
    });

    it('should validate bidId during construction', () => {
      expect(() => new BidManager({
        id: 1,
        userId: 1,
        bidId: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })).toThrow('bidId must be a positive integer');
    });
  });

  describe('validateUserId', () => {
    it('should not throw error for valid positive integer userId', () => {
      expect(() => BidManager.validateUserId(1)).not.toThrow();
      expect(() => BidManager.validateUserId(100)).not.toThrow();
    });

    it('should throw error for zero userId', () => {
      expect(() => BidManager.validateUserId(0)).toThrow('userId must be a positive integer');
    });

    it('should throw error for negative userId', () => {
      expect(() => BidManager.validateUserId(-1)).toThrow('userId must be a positive integer');
    });

    it('should throw error for non-integer userId', () => {
      expect(() => BidManager.validateUserId(1.5)).toThrow('userId must be a positive integer');
    });

    it('should throw error for NaN userId', () => {
      expect(() => BidManager.validateUserId(NaN)).toThrow('userId must be a positive integer');
    });
  });

  describe('validateBidId', () => {
    it('should not throw error for valid positive integer bidId', () => {
      expect(() => BidManager.validateBidId(1)).not.toThrow();
      expect(() => BidManager.validateBidId(100)).not.toThrow();
    });

    it('should throw error for zero bidId', () => {
      expect(() => BidManager.validateBidId(0)).toThrow('bidId must be a positive integer');
    });

    it('should throw error for negative bidId', () => {
      expect(() => BidManager.validateBidId(-1)).toThrow('bidId must be a positive integer');
    });

    it('should throw error for non-integer bidId', () => {
      expect(() => BidManager.validateBidId(1.5)).toThrow('bidId must be a positive integer');
    });

    it('should throw error for NaN bidId', () => {
      expect(() => BidManager.validateBidId(NaN)).toThrow('bidId must be a positive integer');
    });
  });
});
