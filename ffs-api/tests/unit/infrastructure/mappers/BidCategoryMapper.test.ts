import { BidCategoryMapper } from '../../../../src/infrastructure/mappers/BidCategoryMapper';
import { BidCategory } from '../../../../src/domain/interfaces/BidCategories/BidCategory';

describe('BidCategoryMapper', () => {
  describe('toPrisma', () => {
    it('should map BidCategory entity to Prisma format', () => {
      const bidCategory = new BidCategory({
        id: 1,
        code: 'CAT-001',
        name: 'Test Category',
        description: 'Test description',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      });

      const result = BidCategoryMapper.toPrisma(bidCategory);

      expect(result).toEqual({
        id: 1,
        code: 'CAT-001',
        name: 'Test Category',
        description: 'Test description',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      });
    });
  });

  describe('toDomain', () => {
    it('should map Prisma model to BidCategory domain entity with description', () => {
      const prismaModel = {
        id: 1,
        code: 'CAT-001',
        name: 'Test Category',
        description: 'Test description',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      const result = BidCategoryMapper.toDomain(prismaModel);

      expect(result).toBeInstanceOf(BidCategory);
      expect(result.id).toBe(1);
      expect(result.code).toBe('CAT-001');
      expect(result.name).toBe('Test Category');
      expect(result.description).toBe('Test description');
      expect(result.createdAt).toEqual(new Date('2023-01-01'));
      expect(result.updatedAt).toEqual(new Date('2023-01-02'));
    });

    it('should map Prisma model to BidCategory domain entity with null description', () => {
      const prismaModel = {
        id: 1,
        code: 'CAT-001',
        name: 'Test Category',
        description: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      const result = BidCategoryMapper.toDomain(prismaModel);

      expect(result).toBeInstanceOf(BidCategory);
      expect(result.description).toBeUndefined();
    });
  });
});
