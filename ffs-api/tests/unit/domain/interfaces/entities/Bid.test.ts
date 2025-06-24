import { Bid } from '../../../../../src/domain/interfaces/Bids/Bid';

describe('Bid Entity', () => {
  const now = new Date();

  describe('constructor', () => {
    it('should create a Bid instance with required fields', () => {
      const bidData = {
        id: 1,
        code: 'BID-001',
        name: 'Test Bid',
        bidYear: '2024',
        status: 'In Process',
      };

      const bid = new Bid(bidData);

      expect(bid.id).toBe(1);
      expect(bid.code).toBe('BID-001');
      expect(bid.name).toBe('Test Bid');
      expect(bid.bidYear).toBe('2024');
      expect(bid.status).toBe('In Process');
    });

    it('should create a Bid instance with all fields', () => {
      const bidData = {
        id: 1,
        code: 'BID-001',
        name: 'Test Bid',
        note: 'Test note',
        bidYear: '2024',
        categoryId: 1,
        status: 'In Process',
        awardType: 'Contract',
        startDate: now,
        endDate: new Date(now.getTime() + 86400000),
        anticipatedOpeningDate: now,
        awardDate: undefined,
        userId: 1,
        description: 'Test description',
        estimatedValue: '100000',
        districtId: 1,
        createdAt: now,
        updatedAt: now,
      };

      const bid = new Bid(bidData);

      expect(bid.id).toBe(1);
      expect(bid.code).toBe('BID-001');
      expect(bid.name).toBe('Test Bid');
      expect(bid.note).toBe('Test note');
      expect(bid.bidYear).toBe('2024');
      expect(bid.categoryId).toBe(1);
      expect(bid.status).toBe('In Process');
      expect(bid.awardType).toBe('Contract');
      expect(bid.startDate).toBe(now);
      expect(bid.endDate).toEqual(new Date(now.getTime() + 86400000));
      expect(bid.anticipatedOpeningDate).toBe(now);
      expect(bid.awardDate).toBeUndefined();
      expect(bid.userId).toBe(1);
      expect(bid.description).toBe('Test description');
      expect(bid.estimatedValue).toBe('100000');
      expect(bid.districtId).toBe(1);
      expect(bid.createdAt).toBe(now);
      expect(bid.updatedAt).toBe(now);
    });

    it('should create a Bid instance without optional fields', () => {
      const bidData = {
        id: 2,
        code: 'BID-002',
        name: 'Minimal Bid',
        bidYear: '2024',
        status: 'In Process',
      };

      const bid = new Bid(bidData);

      expect(bid.id).toBe(2);
      expect(bid.code).toBe('BID-002');
      expect(bid.name).toBe('Minimal Bid');
      expect(bid.bidYear).toBe('2024');
      expect(bid.status).toBe('In Process');
      expect(bid.note).toBeUndefined();
      expect(bid.categoryId).toBeUndefined();
      expect(bid.awardType).toBeUndefined();
      expect(bid.startDate).toBeUndefined();
      expect(bid.endDate).toBeUndefined();
      expect(bid.anticipatedOpeningDate).toBeUndefined();
      expect(bid.awardDate).toBeUndefined();
      expect(bid.userId).toBeUndefined();
      expect(bid.description).toBeUndefined();
      expect(bid.estimatedValue).toBeUndefined();
      expect(bid.districtId).toBeUndefined();
      expect(bid.createdAt).toBeInstanceOf(Date);
      expect(bid.updatedAt).toBeUndefined();
    });
  });

  describe('validation methods', () => {
    it('should validate name', () => {
      expect(() => Bid.validateName('Test Bid')).not.toThrow();
      expect(() => Bid.validateName('')).toThrow('name is required');
    });

    it('should validate bid year', () => {
      expect(() => Bid.validateName('2024')).not.toThrow();
      expect(() => Bid.validateName('')).toThrow('name is required');
    });

    it('should validate status', () => {
      expect(() => Bid.validateStatus('In Process')).not.toThrow();
      expect(() => Bid.validateStatus('Invalid')).toThrow();
    });
  });

  describe('status update methods', () => {
    it('should mark bid as released', () => {
      const bid = new Bid({
        id: 1,
        code: 'BID-001',
        name: 'Test Bid',
        bidYear: '2024',
        status: 'In Process',
      });

      bid.markAsReleased();

      expect(bid.status).toBe('Released');
      expect(bid.updatedAt).toBeInstanceOf(Date);
    });

    it('should mark bid as opened', () => {
      const bid = new Bid({
        id: 1,
        code: 'BID-001',
        name: 'Test Bid',
        bidYear: '2024',
        status: 'Released',
      });

      bid.markAsOpened();

      expect(bid.status).toBe('Opened');
    });

    it('should mark bid as awarded', () => {
      const bid = new Bid({
        id: 1,
        code: 'BID-001',
        name: 'Test Bid',
        bidYear: '2024',
        status: 'Opened',
      });

      bid.markAsAwarded();

      expect(bid.status).toBe('Awarded');
    });

    it('should assign bid manager', () => {
      const bid = new Bid({
        id: 1,
        code: 'BID-001',
        name: 'Test Bid',
        bidYear: '2024',
        status: 'In Process',
      });

      bid.assignBidManager(123);

      expect(bid.userId).toBe(123);
      expect(bid.updatedAt).toBeInstanceOf(Date);
    });

    it('should update estimated value', () => {
      const bid = new Bid({
        id: 1,
        code: 'BID-001',
        name: 'Test Bid',
        bidYear: '2024',
        status: 'In Process',
      });

      bid.updateEstimatedValue('500000');

      expect(bid.estimatedValue).toBe('500000');
      expect(bid.updatedAt).toBeInstanceOf(Date);
    });
  });
});
