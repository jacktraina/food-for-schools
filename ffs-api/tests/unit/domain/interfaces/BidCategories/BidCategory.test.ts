import { BidCategory } from '../../../../../src/domain/interfaces/BidCategories/BidCategory';

describe('BidCategory', () => {
  describe('constructor', () => {
    it('should create BidCategory with all properties', () => {
      const bidCategory = new BidCategory({
        id: 1,
        code: 'CAT-001',
        name: 'Test Category',
        description: 'Test description',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      });

      expect(bidCategory.id).toBe(1);
      expect(bidCategory.code).toBe('CAT-001');
      expect(bidCategory.name).toBe('Test Category');
      expect(bidCategory.description).toBe('Test description');
    });

    it('should validate name during construction', () => {
      expect(() => new BidCategory({
        id: 1,
        code: 'CAT-001',
        name: '',
        createdAt: new Date(),
        updatedAt: new Date()
      })).toThrow('name is required and cannot be empty');
    });

    it('should validate code during construction', () => {
      expect(() => new BidCategory({
        id: 1,
        code: '',
        name: 'Test Category',
        createdAt: new Date(),
        updatedAt: new Date()
      })).toThrow('code is required and cannot be empty');
    });
  });

  describe('validateName', () => {
    it('should not throw error for valid name', () => {
      expect(() => BidCategory.validateName('Valid Category')).not.toThrow();
    });

    it('should throw error for empty name', () => {
      expect(() => BidCategory.validateName('')).toThrow('name is required and cannot be empty');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => BidCategory.validateName('   ')).toThrow('name is required and cannot be empty');
    });

    it('should throw error for null name', () => {
      expect(() => BidCategory.validateName(null as any)).toThrow('name is required and cannot be empty');
    });

    it('should throw error for undefined name', () => {
      expect(() => BidCategory.validateName(undefined as any)).toThrow('name is required and cannot be empty');
    });
  });

  describe('validateCode', () => {
    it('should not throw error for valid code', () => {
      expect(() => BidCategory.validateCode('CAT-001')).not.toThrow();
    });

    it('should throw error for empty code', () => {
      expect(() => BidCategory.validateCode('')).toThrow('code is required and cannot be empty');
    });

    it('should throw error for whitespace-only code', () => {
      expect(() => BidCategory.validateCode('   ')).toThrow('code is required and cannot be empty');
    });

    it('should throw error for null code', () => {
      expect(() => BidCategory.validateCode(null as any)).toThrow('code is required and cannot be empty');
    });

    it('should throw error for undefined code', () => {
      expect(() => BidCategory.validateCode(undefined as any)).toThrow('code is required and cannot be empty');
    });
  });
});
