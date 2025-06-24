import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { PrismaClient } from '@prisma/client';
import { Bid } from '../../../../src/domain/interfaces/Bids/Bid';
import { BidRepository } from '../../../../src/infrastructure/repositories/BidRepository';

jest.mock('@prisma/client');

describe('BidRepository', () => {
  let bidRepository: BidRepository;

  const mockBidModel = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockPrisma = {
    bid: mockBidModel,
  };

  const mockDatabaseService: jest.Mocked<IDatabaseService> = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    runInTransaction: jest.fn(),
    getClient: jest.fn().mockReturnValue(mockPrisma as unknown as PrismaClient),
  };

  const now = new Date();
  const sampleBidData = {
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
    awardDate: null,
    userId: 1,
    description: 'Test description',
    estimatedValue: '100000',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    bidRepository = new BidRepository(mockDatabaseService);
  });

  describe('countActive', () => {
    it('should return the count of active bids', async () => {
      mockBidModel.count.mockResolvedValue(5);

      const result = await bidRepository.countActive();

      expect(mockBidModel.count).toHaveBeenCalled();
      expect(result).toBe(5);
    });
  });

  describe('create', () => {
    it('should create a bid and return a Bid instance', async () => {
      mockBidModel.create.mockResolvedValue(sampleBidData);

      const bid = new Bid({
        id: 1,
        code: 'BID-001',
        name: 'Test Bid',
        bidYear: '2024',
        status: 'In Process',
      });

      const result = await bidRepository.create(bid);

      expect(mockBidModel.create).toHaveBeenCalledWith({
        data: {
          code: 'BID-001',
          name: 'Test Bid',
          note: undefined,
          bidYear: '2024',
          categoryId: undefined,
          status: 'In Process',
          awardType: undefined,
          startDate: undefined,
          endDate: undefined,
          anticipatedOpeningDate: undefined,
          awardDate: undefined,
          userId: undefined,
          description: undefined,
          estimatedValue: undefined,
          cooperativeId: undefined,
          districtId: undefined,
          isDeleted: false,
          createdAt: expect.any(Date),
          updatedAt: undefined,
        },
        select: {
          id: true,
          code: true,
          name: true,
          note: true,
          bidYear: true,
          categoryId: true,
          status: true,
          awardType: true,
          startDate: true,
          endDate: true,
          anticipatedOpeningDate: true,
          awardDate: true,
          userId: true,
          description: true,
          estimatedValue: true,
          cooperativeId: true,
          districtId: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toBeInstanceOf(Bid);
      expect(result.name).toBe('Test Bid');
    });
  });

  describe('findById', () => {
    it('should return a Bid instance when found', async () => {
      mockBidModel.findUnique.mockResolvedValue(sampleBidData);

      const result = await bidRepository.findById(1);

      expect(mockBidModel.findUnique).toHaveBeenCalledWith({
        where: { 
          id: 1, 
          isDeleted: false,
          district: {
            isDeleted: false,
          },
        },
        select: expect.any(Object),
      });

      expect(result).toBeInstanceOf(Bid);
      expect(result?.name).toBe('Test Bid');
    });

    it('should return null when not found', async () => {
      mockBidModel.findUnique.mockResolvedValue(null);

      const result = await bidRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return an array of Bid instances', async () => {
      mockBidModel.findMany.mockResolvedValue([sampleBidData]);

      const result = await bidRepository.findAll();

      expect(mockBidModel.findMany).toHaveBeenCalledWith({
        where: { 
          isDeleted: false,
          district: {
            isDeleted: false,
          },
        },
        orderBy: { id: 'desc' },
        select: expect.any(Object),
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Bid);
    });
  });

  describe('findByBidManager', () => {
    it('should return bids for the specified bid manager', async () => {
      mockBidModel.findMany.mockResolvedValue([sampleBidData]);

      const result = await bidRepository.findByBidManager(1);

      expect(mockBidModel.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          district: {
            isDeleted: false,
          },
          OR: [
            { userId: 1 },
            { userManagedBids: { some: { userId: 1 } } },
          ],
        },
        orderBy: { id: 'desc' },
        select: expect.any(Object),
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Bid);
    });
  });

  describe('findByDistrictId', () => {
    it('should return bids for the specified district', async () => {
      const sampleBidWithUser = {
        ...sampleBidData,
        user: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      mockBidModel.findMany.mockResolvedValue([sampleBidWithUser]);

      const result = await bidRepository.findByDistrictId(1);

      expect(mockBidModel.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          district: {
            isDeleted: false,
          },
          districtId: 1,
        },
        orderBy: { id: 'desc' },
        select: {
          id: true,
          code: true,
          name: true,
          note: true,
          bidYear: true,
          categoryId: true,
          status: true,
          awardType: true,
          startDate: true,
          endDate: true,
          anticipatedOpeningDate: true,
          awardDate: true,
          userId: true,
          description: true,
          estimatedValue: true,
          cooperativeId: true,
          districtId: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Bid);
      expect(result[0].name).toBe('Test Bid');
    });

    it('should return empty array when no bids found for district', async () => {
      mockBidModel.findMany.mockResolvedValue([]);

      const result = await bidRepository.findByDistrictId(999);

      expect(result).toHaveLength(0);
    });
  });

  describe('findByCooperativeId', () => {
    it('should return bids for the specified cooperative', async () => {
      const sampleBidWithUser = {
        ...sampleBidData,
        user: {
          id: 1,
          firstName: 'Jane',
          lastName: 'Smith',
        },
      };
      mockBidModel.findMany.mockResolvedValue([sampleBidWithUser]);

      const result = await bidRepository.findByCooperativeId(1);

      expect(mockBidModel.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          district: {
            isDeleted: false,
          },
          cooperativeId: 1,
        },
        orderBy: { id: 'desc' },
        select: {
          id: true,
          code: true,
          name: true,
          note: true,
          bidYear: true,
          categoryId: true,
          status: true,
          awardType: true,
          startDate: true,
          endDate: true,
          anticipatedOpeningDate: true,
          awardDate: true,
          userId: true,
          description: true,
          estimatedValue: true,
          cooperativeId: true,
          districtId: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Bid);
      expect(result[0].name).toBe('Test Bid');
    });

    it('should return empty array when no bids found for cooperative', async () => {
      mockBidModel.findMany.mockResolvedValue([]);

      const result = await bidRepository.findByCooperativeId(999);

      expect(result).toHaveLength(0);
    });
  });



  describe('update', () => {
    it('should update a bid and return the updated Bid instance', async () => {
      mockBidModel.update.mockResolvedValue(sampleBidData);

      const bid = new Bid({
        id: 1,
        code: 'BID-001',
        name: 'Updated Bid',
        bidYear: '2024',
        status: 'In Process',
      });

      const result = await bidRepository.update(bid);

      expect(mockBidModel.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.any(Object),
        select: expect.any(Object),
      });

      expect(result).toBeInstanceOf(Bid);
    });
  });

  describe('delete', () => {
    it('should delete a bid and return true', async () => {
      mockBidModel.delete.mockResolvedValue(sampleBidData);

      const result = await bidRepository.delete(1);

      expect(mockBidModel.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(result).toBe(true);
    });

    it('should return false when deletion fails', async () => {
      mockBidModel.delete.mockRejectedValue(new Error('Delete failed'));

      const result = await bidRepository.delete(1);

      expect(result).toBe(false);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a bid successfully', async () => {
      mockBidModel.update.mockResolvedValue(sampleBidData);

      await bidRepository.softDelete(1);

      expect(mockBidModel.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isDeleted: true },
      });
    });

    it('should throw error when soft delete fails', async () => {
      mockBidModel.update.mockRejectedValue(new Error('Update failed'));

      await expect(bidRepository.softDelete(1)).rejects.toThrow('Update failed');
    });
  });
});
