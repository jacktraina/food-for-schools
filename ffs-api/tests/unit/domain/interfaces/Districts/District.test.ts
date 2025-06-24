import { District } from '../../../../../src/domain/interfaces/Districts/District';

describe('District', () => {
  describe('constructor', () => {
    it('should create District with valid properties', () => {
      const district = new District({
        name: 'Test District',
        statusId: 1
      });

      expect(district.name).toBe('Test District');
      expect(district.statusId).toBe(1);
    });

    it('should validate name during construction', () => {
      expect(() => new District({
        name: '',
        statusId: 1
      })).toThrow('name is required and cannot be empty');
    });

    it('should validate statusId during construction', () => {
      expect(() => new District({
        name: 'Test District',
        statusId: 0
      })).toThrow('statusId must be a positive integer');
    });
  });

  describe('validateName', () => {
    it('should not throw error for valid name', () => {
      expect(() => District.validateName('Valid District Name')).not.toThrow();
    });

    it('should throw error for empty name', () => {
      expect(() => District.validateName('')).toThrow('name is required and cannot be empty');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => District.validateName('   ')).toThrow('name is required and cannot be empty');
    });

    it('should throw error for null name', () => {
      expect(() => District.validateName(null as any)).toThrow('name is required and cannot be empty');
    });

    it('should throw error for undefined name', () => {
      expect(() => District.validateName(undefined as any)).toThrow('name is required and cannot be empty');
    });
  });

  describe('validateStatusId', () => {
    it('should not throw error for valid positive integer statusId', () => {
      expect(() => District.validateStatusId(1)).not.toThrow();
      expect(() => District.validateStatusId(100)).not.toThrow();
    });

    it('should throw error for zero statusId', () => {
      expect(() => District.validateStatusId(0)).toThrow('statusId must be a positive integer');
    });

    it('should throw error for negative statusId', () => {
      expect(() => District.validateStatusId(-1)).toThrow('statusId must be a positive integer');
    });

    it('should throw error for non-integer statusId', () => {
      expect(() => District.validateStatusId(1.5)).toThrow('statusId must be a positive integer');
    });

    it('should throw error for NaN statusId', () => {
      expect(() => District.validateStatusId(NaN)).toThrow('statusId must be a positive integer');
    });
  });

  describe('isActive', () => {
    it('should return true when statusId is 1', () => {
      const district = new District({
        name: 'Test District',
        statusId: 1
      });

      expect(district.isActive()).toBe(true);
    });

    it('should return false when statusId is not 1', () => {
      const district = new District({
        name: 'Test District',
        statusId: 2
      });

      expect(district.isActive()).toBe(false);
    });
  });

  describe('getDisplayName', () => {
    it('should return the district name', () => {
      const district = new District({
        name: 'Test District',
        statusId: 1
      });

      expect(district.getDisplayName()).toBe('Test District');
    });
  });
});
