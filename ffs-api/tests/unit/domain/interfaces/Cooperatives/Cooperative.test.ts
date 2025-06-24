import { Cooperative } from '../../../../../src/domain/interfaces/Cooperatives/Cooperative';

describe('Cooperative', () => {
  describe('constructor', () => {
    it('should create Cooperative with valid properties', () => {
      const cooperative = new Cooperative({
        id: 1,
        code: 'COOP-001',
        name: 'Test Cooperative',
        organizationTypeId: 1,
        userStatusId: 1,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      });

      expect(cooperative.id).toBe(1);
      expect(cooperative.code).toBe('COOP-001');
      expect(cooperative.name).toBe('Test Cooperative');
    });

    it('should validate code during construction', () => {
      expect(() => new Cooperative({
        id: 1,
        code: '',
        name: 'Test Cooperative',
        organizationTypeId: 1,
        userStatusId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })).toThrow('code is required and cannot be empty');
    });

    it('should validate name during construction', () => {
      expect(() => new Cooperative({
        id: 1,
        code: 'COOP-001',
        name: '',
        organizationTypeId: 1,
        userStatusId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })).toThrow('name is required and cannot be empty');
    });
  });

  describe('validateCode', () => {
    it('should not throw error for valid code', () => {
      expect(() => Cooperative.validateCode('COOP-001')).not.toThrow();
      expect(() => Cooperative.validateCode('A')).not.toThrow();
    });

    it('should throw error for empty code', () => {
      expect(() => Cooperative.validateCode('')).toThrow('code is required and cannot be empty');
    });

    it('should throw error for whitespace-only code', () => {
      expect(() => Cooperative.validateCode('   ')).toThrow('code is required and cannot be empty');
    });

    it('should throw error for null code', () => {
      expect(() => Cooperative.validateCode(null as any)).toThrow('code is required and cannot be empty');
    });

    it('should throw error for undefined code', () => {
      expect(() => Cooperative.validateCode(undefined as any)).toThrow('code is required and cannot be empty');
    });

    it('should throw error for code exceeding 50 characters', () => {
      const longCode = 'A'.repeat(51);
      expect(() => Cooperative.validateCode(longCode)).toThrow('code must not exceed 50 characters');
    });

    it('should not throw error for code with exactly 50 characters', () => {
      const maxCode = 'A'.repeat(50);
      expect(() => Cooperative.validateCode(maxCode)).not.toThrow();
    });
  });

  describe('validateName', () => {
    it('should not throw error for valid name', () => {
      expect(() => Cooperative.validateName('Valid Cooperative Name')).not.toThrow();
    });

    it('should throw error for empty name', () => {
      expect(() => Cooperative.validateName('')).toThrow('name is required and cannot be empty');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => Cooperative.validateName('   ')).toThrow('name is required and cannot be empty');
    });

    it('should throw error for null name', () => {
      expect(() => Cooperative.validateName(null as any)).toThrow('name is required and cannot be empty');
    });

    it('should throw error for undefined name', () => {
      expect(() => Cooperative.validateName(undefined as any)).toThrow('name is required and cannot be empty');
    });
  });
});
