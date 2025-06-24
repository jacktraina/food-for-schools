import { DistrictProductRepository } from '../../../../src/infrastructure/repositories/DistrictProductRepository';
import { DistrictProduct } from '../../../../src/domain/interfaces/DistrictProducts/DistrictProduct';

describe('DistrictProductRepository', () => {
  let repository: DistrictProductRepository;
  let mockDatabaseService: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      districtProduct: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    mockDatabaseService = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      getClient: jest.fn().mockReturnValue(mockPrisma),
      runInTransaction: jest.fn(),
    };

    repository = new DistrictProductRepository(mockDatabaseService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create district product successfully', async () => {
      const districtProductData = {
        districtId: 1,
        productName: 'Math Curriculum',
      };

      const mockCreatedProduct = {
        id: 1,
        districtId: 1,
        productName: 'Math Curriculum',
        createdAt: new Date(),
        district: { id: 1, name: 'Test District' },
      };

      mockPrisma.districtProduct.create.mockResolvedValue(mockCreatedProduct);

      const result = await repository.create(districtProductData);

      expect(result).toBeInstanceOf(DistrictProduct);
      expect(result.productName).toBe('Math Curriculum');
      expect(mockPrisma.districtProduct.create).toHaveBeenCalledWith({
        data: districtProductData,
        select: {
          id: true,
          districtId: true,
          productName: true,
          createdAt: true,
          district: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('should handle unique constraint error', async () => {
      const districtProductData = {
        districtId: 1,
        productName: 'Math Curriculum',
      };

      const uniqueConstraintError = new Error('Unique constraint failed');
      (uniqueConstraintError as any).code = 'P2002';

      mockPrisma.districtProduct.create.mockRejectedValue(uniqueConstraintError);

      await expect(repository.create(districtProductData))
        .rejects.toThrow('A product with this name already exists for the specified district');
    });

    it('should handle general errors', async () => {
      const districtProductData = {
        districtId: 1,
        productName: 'Math Curriculum',
      };

      const generalError = new Error('Database connection failed');

      mockPrisma.districtProduct.create.mockRejectedValue(generalError);

      await expect(repository.create(districtProductData))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('createWithTransaction', () => {
    it('should create district product with transaction successfully', async () => {
      const districtProductData = {
        districtId: 1,
        productName: 'Math Curriculum',
      };

      const mockCreatedProduct = {
        id: 1,
        districtId: 1,
        productName: 'Math Curriculum',
        createdAt: new Date(),
        district: { id: 1, name: 'Test District' },
      };

      const mockPrismaTransaction = {
        districtProduct: {
          create: jest.fn().mockResolvedValue(mockCreatedProduct)
        }
      };

      const result = await repository.createWithTransaction(mockPrismaTransaction as any, districtProductData);

      expect(result).toBeInstanceOf(DistrictProduct);
      expect(result.productName).toBe('Math Curriculum');
      expect(mockPrismaTransaction.districtProduct.create).toHaveBeenCalledWith({
        data: districtProductData,
        select: {
          id: true,
          districtId: true,
          productName: true,
          createdAt: true,
          district: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('should handle unique constraint error in transaction', async () => {
      const districtProductData = {
        districtId: 1,
        productName: 'Math Curriculum',
      };

      const uniqueConstraintError = new Error('Unique constraint failed');
      (uniqueConstraintError as any).code = 'P2002';

      const mockPrismaTransaction = {
        districtProduct: {
          create: jest.fn().mockRejectedValue(uniqueConstraintError)
        }
      };

      await expect(repository.createWithTransaction(mockPrismaTransaction as any, districtProductData))
        .rejects.toThrow('A product with this name already exists for the specified district');
    });

    it('should handle general transaction errors', async () => {
      const districtProductData = {
        districtId: 1,
        productName: 'Math Curriculum',
      };

      const generalError = new Error('Database connection failed');

      const mockPrismaTransaction = {
        districtProduct: {
          create: jest.fn().mockRejectedValue(generalError)
        }
      };

      await expect(repository.createWithTransaction(mockPrismaTransaction as any, districtProductData))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('findByDistrictId', () => {
    it('should find district products by district ID', async () => {
      const districtId = 1;
      const mockProducts = [
        {
          id: 1,
          districtId: 1,
          productName: 'Math Curriculum',
          createdAt: new Date(),
          district: { id: 1, name: 'Test District' },
        },
        {
          id: 2,
          districtId: 1,
          productName: 'Science Program',
          createdAt: new Date(),
          district: { id: 1, name: 'Test District' },
        },
      ];

      mockPrisma.districtProduct.findMany.mockResolvedValue(mockProducts);

      const result = await repository.findByDistrictId(districtId);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(DistrictProduct);
      expect(result[1]).toBeInstanceOf(DistrictProduct);
      expect(mockPrisma.districtProduct.findMany).toHaveBeenCalledWith({
        where: { districtId },
        select: {
          id: true,
          districtId: true,
          productName: true,
          createdAt: true,
          district: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe('deleteByDistrictId', () => {
    it('should delete district products by district ID', async () => {
      const districtId = 1;

      mockPrisma.districtProduct.deleteMany.mockResolvedValue({ count: 2 });

      await repository.deleteByDistrictId(districtId);

      expect(mockPrisma.districtProduct.deleteMany).toHaveBeenCalledWith({
        where: { districtId },
      });
    });
  });
});
