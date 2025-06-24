import { DistrictProductRepository } from '../../../../src/infrastructure/repositories/DistrictProductRepository';
import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { PrismaClient } from '@prisma/client';
import { DistrictProduct } from '../../../../src/domain/interfaces/DistrictProducts/DistrictProduct';

jest.mock('@prisma/client');

describe('DistrictProductRepository', () => {
  let districtProductRepository: DistrictProductRepository;

  const mockDistrictProductModel = {
    create: jest.fn(),
    deleteMany: jest.fn(),
    findMany: jest.fn(),
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

  describe('deleteByDistrictId', () => {
    const mockDistrictId = 42;
  
    beforeEach(() => {
      mockDistrictProductModel.deleteMany.mockReset();
    });
  
    it('should delete all products for the given district ID', async () => {
      await districtProductRepository.deleteByDistrictId(mockDistrictId);
  
      expect(mockDistrictProductModel.deleteMany).toHaveBeenCalledWith({
        where: { districtId: mockDistrictId },
      });
    });
  
    it('should throw an error if deletion fails', async () => {
      mockDistrictProductModel.deleteMany.mockRejectedValue(new Error('Delete failed'));
  
      await expect(
        districtProductRepository.deleteByDistrictId(mockDistrictId)
      ).rejects.toThrow('Delete failed');
  
      expect(mockDistrictProductModel.deleteMany).toHaveBeenCalledWith({
        where: { districtId: mockDistrictId },
      });
    });
  });
  
  describe('findByDistrictId', () => {
    const mockDistrictId = 1;
    const now = new Date();
  
    const mockDistrictProducts = [
      {
        id: 101,
        districtId: mockDistrictId,
        productName: 'Premium Access',
        createdAt: now,
      },
      {
        id: 102,
        districtId: mockDistrictId,
        productName: 'Basic Access',
        createdAt: now,
      },
    ];
  
    it('should return an array of DistrictProduct instances when products are found', async () => {
      mockDistrictProductModel.findMany.mockResolvedValue(mockDistrictProducts);
  
      const result = await districtProductRepository.findByDistrictId(mockDistrictId);
  
      expect(mockDistrictProductModel.findMany).toHaveBeenCalledWith({
        where: { districtId: mockDistrictId },
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
  
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(DistrictProduct);
      expect(result[0]).toMatchObject({
        id: 101,
        districtId: mockDistrictId,
        productName: 'Premium Access',
        createdAt: now,
      });
    });
  
    it('should return an empty array if no products are found', async () => {
      mockDistrictProductModel.findMany.mockResolvedValue([]);
  
      const result = await districtProductRepository.findByDistrictId(mockDistrictId);
  
      expect(result).toEqual([]);
    });
  
    it('should throw an error if the DB call fails', async () => {
      mockDistrictProductModel.findMany.mockRejectedValue(new Error('Database error'));
  
      await expect(
        districtProductRepository.findByDistrictId(mockDistrictId)
      ).rejects.toThrow('Database error');
    });
  });
});
