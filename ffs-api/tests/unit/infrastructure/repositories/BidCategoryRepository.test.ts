import { BidCategoryRepository } from '../../../../src/infrastructure/repositories/BidCategoryRepository';
import { BidCategory } from '../../../../src/domain/interfaces/BidCategories/BidCategory';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    bidCategories: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('BidCategoryRepository', () => {
  let bidCategoryRepository: BidCategoryRepository;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    bidCategoryRepository = new BidCategoryRepository();
    mockPrisma = (bidCategoryRepository as any).prisma;
  });

  describe('findAll', () => {
    it('should return all bid categories as BidCategory instances', async () => {
      const mockCategories = [
        { 
          id: 1, 
          code: 'CAT-001',
          name: 'Food Services', 
          description: 'Food-related services',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { 
          id: 2, 
          code: 'CAT-002',
          name: 'Technology', 
          description: 'Tech equipment',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      mockPrisma.bidCategories.findMany.mockResolvedValue(mockCategories);

      const result = await bidCategoryRepository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(BidCategory);
      expect(result[0].name).toBe('Food Services');
      expect(mockPrisma.bidCategories.findMany).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockPrisma.bidCategories.findMany.mockRejectedValue(new Error('Database error'));

      await expect(bidCategoryRepository.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return bid category when found', async () => {
      const mockCategory = { 
        id: 1, 
        code: 'CAT-001',
        name: 'Food Services', 
        description: 'Food-related services',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.bidCategories.findUnique.mockResolvedValue(mockCategory);

      const result = await bidCategoryRepository.findById(1);

      expect(result).toBeInstanceOf(BidCategory);
      expect(result?.name).toBe('Food Services');
      expect(mockPrisma.bidCategories.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('should return null when not found', async () => {
      mockPrisma.bidCategories.findUnique.mockResolvedValue(null);

      const result = await bidCategoryRepository.findById(999);

      expect(result).toBeNull();
    });
  });
});
