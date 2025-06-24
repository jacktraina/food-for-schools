import { DistrictProductRepository } from '../../../../src/infrastructure/repositories/DistrictProductRepository';
import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { PrismaClient } from '@prisma/client';
import { DistrictProduct } from '../../../../src/domain/interfaces/DistrictProducts/DistrictProduct';

jest.mock('@prisma/client');

describe('DistrictProductRepository', () => {
  let districtProductRepository: DistrictProductRepository;

  const mockDistrictProductModel = {
    create: jest.fn(),
  };

  const mockPrisma = {
    districtProduct: mockDistrictProductModel,
  };

  const mockDatabaseService: jest.Mocked<IDatabaseService> = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    runInTransaction: jest.fn(),
    getClient: jest.fn().mockReturnValue(mockPrisma as unknown as PrismaClient),
  };

  const now = new Date();
  const sampleDistrictProductData = {
    districtId: 1,
    productName: 'Premium Access',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    districtProductRepository = new DistrictProductRepository(mockDatabaseService);
  });

  describe('create', () => {
    it('should create a district product and return a DistrictProduct instance', async () => {
      mockDistrictProductModel.create.mockResolvedValue({
        id: 101,
        ...sampleDistrictProductData,
        createdAt: now,
      });

      const result = await districtProductRepository.create(sampleDistrictProductData);

      expect(mockDistrictProductModel.create).toHaveBeenCalledWith({
        data: sampleDistrictProductData,
      });

      expect(result).toBeInstanceOf(DistrictProduct);
      expect(result).toMatchObject({
        id: 101,
        districtId: 1,
        productName: 'Premium Access',
        createdAt: now,
      });
    });

    it('should throw an error when creation fails', async () => {
      mockDistrictProductModel.create.mockRejectedValue(new Error('Database error'));

      await expect(
        districtProductRepository.create(sampleDistrictProductData)
      ).rejects.toThrow('Database error');
    });
  });
});
