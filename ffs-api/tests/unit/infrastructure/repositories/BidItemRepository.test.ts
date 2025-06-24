import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { PrismaClient } from '@prisma/client';
import { BidItem } from '../../../../src/domain/interfaces/BidItems/BidItem';
import { BidItemRepository } from '../../../../src/infrastructure/repositories/BidItemRepository';

jest.mock('@prisma/client');

describe('BidItemRepository', () => {
  let bidItemRepository: BidItemRepository;

  const mockBidItemModel = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrisma = {
    bidItems: mockBidItemModel,
  };

  const mockDatabaseService: jest.Mocked<IDatabaseService> = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    runInTransaction: jest.fn(),
    getClient: jest.fn().mockReturnValue(mockPrisma as unknown as PrismaClient),
  };

  const now = new Date();
  const sampleBidItemData = {
    id: 12957,
    bidId: 1001,
    itemName: 'Calzone, Buffalo Chicken, WG, 2MMA/2GE',
    acceptableBrands: 'Albies, Bosco, Ginos',
    awardGroup: 'Albies',
    diversion: 'No',
    status: 'Active',
    projection: 525,
    projectionUnit: 'Case',
    minProjection: 50,
    totalBidUnits: 25200,
    bidUnit: 'EA',
    bidUnitProjUnit: 48.0,
    percentDistrictsUsing: 23,
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
    bid: {
      id: 1001,
      name: '2023 Frozen Foods Bid',
      code: 'FFB2023',
      status: 'In Process',
      note: null,
      bidYear: '2023',
      categoryId: null,
      awardType: null,
      startDate: null,
      endDate: null,
      anticipatedOpeningDate: null,
      awardDate: null,
      userId: null,
      description: null,
      estimatedValue: null,
      cooperativeId: null,
      districtId: null,
      schoolId: null,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    bidItemRepository = new BidItemRepository(mockDatabaseService);
  });

  describe('findAll', () => {
    it('should return an array of BidItem instances', async () => {
      mockBidItemModel.findMany.mockResolvedValue([sampleBidItemData]);

      const result = await bidItemRepository.findAll();

      expect(mockBidItemModel.findMany).toHaveBeenCalledWith({
        where: {
          bid: {
            isDeleted: false,
            district: {
              isDeleted: false,
            },
          },
          isDeleted: false
        },
        include: {
          bid: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(BidItem);
      expect(result[0].itemName).toBe('Calzone, Buffalo Chicken, WG, 2MMA/2GE');
    });

    it('should handle Decimal to number conversion', async () => {
      const dataWithDecimals = {
        ...sampleBidItemData,
        projection: { toString: () => '525.50' },
        minProjection: { toString: () => '50.25' },
        totalBidUnits: { toString: () => '25200.75' },
        bidUnitProjUnit: { toString: () => '48.5' },
        percentDistrictsUsing: { toString: () => '23.8' },
      };

      mockBidItemModel.findMany.mockResolvedValue([dataWithDecimals]);

      const result = await bidItemRepository.findAll();

      expect(result[0].projection).toBe(525.5);
      expect(result[0].minProjection).toBe(50.25);
      expect(result[0].totalBidUnits).toBe(25200.75);
      expect(result[0].bidUnitProjUnit).toBe(48.5);
      expect(result[0].percentDistrictsUsing).toBe(23.8);
    });

    it('should handle null Decimal values', async () => {
      const dataWithNulls = {
        ...sampleBidItemData,
        projection: null,
        minProjection: null,
        totalBidUnits: null,
        bidUnitProjUnit: null,
        percentDistrictsUsing: null,
      };

      mockBidItemModel.findMany.mockResolvedValue([dataWithNulls]);

      const result = await bidItemRepository.findAll();

      expect(result[0].projection).toBeNull();
      expect(result[0].minProjection).toBeNull();
      expect(result[0].totalBidUnits).toBeNull();
      expect(result[0].bidUnitProjUnit).toBeNull();
      expect(result[0].percentDistrictsUsing).toBeNull();
    });

    it('should handle undefined createdAt and updatedAt', async () => {
      const dataWithUndefinedDates = {
        ...sampleBidItemData,
        createdAt: undefined,
        updatedAt: undefined,
      };

      mockBidItemModel.findMany.mockResolvedValue([dataWithUndefinedDates]);

      const result = await bidItemRepository.findAll();

      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].updatedAt).toBeUndefined();
    });

    it('should handle undefined isDeleted', async () => {
      const dataWithUndefinedIsDeleted = {
        ...sampleBidItemData,
        isDeleted: undefined,
      };

      mockBidItemModel.findMany.mockResolvedValue([dataWithUndefinedIsDeleted]);

      const result = await bidItemRepository.findAll();

      expect(result[0].isDeleted).toBe(false);
    });
  });

  describe('findByBidId', () => {
    it('should return bid items for the specified bid ID', async () => {
      mockBidItemModel.findMany.mockResolvedValue([sampleBidItemData]);

      const result = await bidItemRepository.findByBidId(1001);

      expect(mockBidItemModel.findMany).toHaveBeenCalledWith({
        where: {
          bidId: 1001,
          bid: {
            isDeleted: false,
            district: {
              isDeleted: false,
            },
          },
          isDeleted: false
        },
        include: {
          bid: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(BidItem);
      expect(result[0].bidId).toBe(1001);
    });

    it('should return empty array when no items found', async () => {
      mockBidItemModel.findMany.mockResolvedValue([]);

      const result = await bidItemRepository.findByBidId(999);

      expect(result).toHaveLength(0);
    });

    it('should handle Decimal conversions in findByBidId', async () => {
      const dataWithDecimals = {
        ...sampleBidItemData,
        projection: { toString: () => '100.5' },
        minProjection: { toString: () => '10.25' },
        totalBidUnits: { toString: () => '1000.75' },
        bidUnitProjUnit: { toString: () => '5.5' },
        percentDistrictsUsing: { toString: () => '15.8' },
      };

      mockBidItemModel.findMany.mockResolvedValue([dataWithDecimals]);

      const result = await bidItemRepository.findByBidId(1001);

      expect(result[0].projection).toBe(100.5);
      expect(result[0].minProjection).toBe(10.25);
      expect(result[0].totalBidUnits).toBe(1000.75);
      expect(result[0].bidUnitProjUnit).toBe(5.5);
      expect(result[0].percentDistrictsUsing).toBe(15.8);
    });
  });

  describe('findById', () => {
    it('should return a BidItem instance when found', async () => {
      mockBidItemModel.findUnique.mockResolvedValue(sampleBidItemData);

      const result = await bidItemRepository.findById(12957);

      expect(mockBidItemModel.findUnique).toHaveBeenCalledWith({
        where: {
          id: 12957,
          bid: {
            isDeleted: false,
            district: {
              isDeleted: false,
            },
          },
          isDeleted: false
        },
        include: {
          bid: true,
        }
      });

      expect(result).toBeInstanceOf(BidItem);
      expect(result?.id).toBe(12957);
      expect(result?.itemName).toBe('Calzone, Buffalo Chicken, WG, 2MMA/2GE');
    });

    it('should return null when not found', async () => {
      mockBidItemModel.findUnique.mockResolvedValue(null);

      const result = await bidItemRepository.findById(999);

      expect(result).toBeNull();
    });

    it('should handle Decimal conversions in findById', async () => {
      const dataWithDecimals = {
        ...sampleBidItemData,
        projection: { toString: () => '200.75' },
        minProjection: { toString: () => '20.5' },
        totalBidUnits: { toString: () => '2000.25' },
        bidUnitProjUnit: { toString: () => '10.75' },
        percentDistrictsUsing: { toString: () => '30.2' },
      };

      mockBidItemModel.findUnique.mockResolvedValue(dataWithDecimals);

      const result = await bidItemRepository.findById(12957);

      expect(result?.projection).toBe(200.75);
      expect(result?.minProjection).toBe(20.5);
      expect(result?.totalBidUnits).toBe(2000.25);
      expect(result?.bidUnitProjUnit).toBe(10.75);
      expect(result?.percentDistrictsUsing).toBe(30.2);
    });

    it('should handle null values in findById', async () => {
      const dataWithNulls = {
        ...sampleBidItemData,
        projection: null,
        minProjection: null,
        totalBidUnits: null,
        bidUnitProjUnit: null,
        percentDistrictsUsing: null,
        createdAt: null,
        updatedAt: null,
        isDeleted: null,
      };

      mockBidItemModel.findUnique.mockResolvedValue(dataWithNulls);

      const result = await bidItemRepository.findById(12957);

      expect(result?.projection).toBeNull();
      expect(result?.minProjection).toBeNull();
      expect(result?.totalBidUnits).toBeNull();
      expect(result?.bidUnitProjUnit).toBeNull();
      expect(result?.percentDistrictsUsing).toBeNull();
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.updatedAt).toBeUndefined();
      expect(result?.isDeleted).toBe(false);
    });
  });

  describe('create', () => {
    it('should create a bid item and return a BidItem instance', async () => {
      mockBidItemModel.create.mockResolvedValue(sampleBidItemData);

      const bidItem = new BidItem({
        id: 12957,
        bidId: 1001,
        itemName: 'Calzone, Buffalo Chicken, WG, 2MMA/2GE',
        acceptableBrands: 'Albies, Bosco, Ginos',
        awardGroup: 'Albies',
        diversion: 'No',
        status: 'Active',
        projection: 525,
        projectionUnit: 'Case',
        minProjection: 50,
        totalBidUnits: 25200,
        bidUnit: 'EA',
        bidUnitProjUnit: 48.0,
        percentDistrictsUsing: 23,
      });

      const result = await bidItemRepository.create(bidItem);

      expect(mockBidItemModel.create).toHaveBeenCalledWith({
        data: {
          bidId: 1001,
          itemName: 'Calzone, Buffalo Chicken, WG, 2MMA/2GE',
          acceptableBrands: 'Albies, Bosco, Ginos',
          awardGroup: 'Albies',
          diversion: 'No',
          status: 'Active',
          projection: 525,
          projectionUnit: 'Case',
          minProjection: 50,
          totalBidUnits: 25200,
          bidUnit: 'EA',
          bidUnitProjUnit: 48.0,
          percentDistrictsUsing: 23,
          isDeleted: false
        },
        include: {
          bid: true,
        },
      });

      expect(result).toBeInstanceOf(BidItem);
      expect(result.itemName).toBe('Calzone, Buffalo Chicken, WG, 2MMA/2GE');
    });

    it('should handle Decimal conversions in create response', async () => {
      const createdDataWithDecimals = {
        ...sampleBidItemData,
        projection: { toString: () => '525.50' },
        minProjection: { toString: () => '50.25' },
        totalBidUnits: { toString: () => '25200.75' },
        bidUnitProjUnit: { toString: () => '48.5' },
        percentDistrictsUsing: { toString: () => '23.8' },
      };

      mockBidItemModel.create.mockResolvedValue(createdDataWithDecimals);

      const bidItem = new BidItem({
        bidId: 1001,
        itemName: 'Test Item',
      });

      const result = await bidItemRepository.create(bidItem);

      expect(result.projection).toBe(525.5);
      expect(result.minProjection).toBe(50.25);
      expect(result.totalBidUnits).toBe(25200.75);
      expect(result.bidUnitProjUnit).toBe(48.5);
      expect(result.percentDistrictsUsing).toBe(23.8);
    });
  });

  describe('update', () => {
    it('should update a bid item and return the updated BidItem instance', async () => {
      const updatedData = {
        ...sampleBidItemData,
        itemName: 'Updated Item Name',
        updatedAt: new Date(),
      };
      mockBidItemModel.update.mockResolvedValue(updatedData);

      const bidItem = new BidItem({
        id: 12957,
        bidId: 1001,
        itemName: 'Updated Item Name',
        acceptableBrands: 'Albies, Bosco, Ginos',
        awardGroup: 'Albies',
        diversion: 'No',
        status: 'Active',
      });

      const result = await bidItemRepository.update(bidItem);

      expect(mockBidItemModel.update).toHaveBeenCalledWith({
        where: { id: 12957 },
        data: {
          itemName: 'Updated Item Name',
          acceptableBrands: 'Albies, Bosco, Ginos',
          awardGroup: 'Albies',
          diversion: 'No',
          status: 'Active',
          projection: undefined,
          projectionUnit: undefined,
          minProjection: undefined,
          totalBidUnits: undefined,
          bidUnit: undefined,
          bidUnitProjUnit: undefined,
          percentDistrictsUsing: undefined,
          updatedAt: expect.any(Date)
        },
        include: {
          bid: true,
        },
      });

      expect(result).toBeInstanceOf(BidItem);
      expect(result.itemName).toBe('Updated Item Name');
    });

    it('should handle Decimal conversions in update response', async () => {
      const updatedDataWithDecimals = {
        ...sampleBidItemData,
        projection: { toString: () => '600.25' },
        minProjection: { toString: () => '60.5' },
        totalBidUnits: { toString: () => '30000.75' },
        bidUnitProjUnit: { toString: () => '50.25' },
        percentDistrictsUsing: { toString: () => '25.5' },
      };

      mockBidItemModel.update.mockResolvedValue(updatedDataWithDecimals);

      const bidItem = new BidItem({
        id: 12957,
        bidId: 1001,
        itemName: 'Test Item',
      });

      const result = await bidItemRepository.update(bidItem);

      expect(result.projection).toBe(600.25);
      expect(result.minProjection).toBe(60.5);
      expect(result.totalBidUnits).toBe(30000.75);
      expect(result.bidUnitProjUnit).toBe(50.25);
      expect(result.percentDistrictsUsing).toBe(25.5);
    });
  });

  describe('delete', () => {
    it('should soft delete bid item and return true', async () => {
      const bidItemId = 1;
      mockPrisma.bidItems.update.mockResolvedValue({
        id: bidItemId,
        isDeleted: true,
        updatedAt: new Date()
      });

      const result = await bidItemRepository.delete(bidItemId);
      
      expect(mockPrisma.bidItems.update).toHaveBeenCalledWith({
        where: { id: bidItemId },
        data: { isDeleted: true, updatedAt: expect.any(Date) },
      });
      expect(result).toBe(true);
    });

    it('should return false when delete fails', async () => {
      const bidItemId = 1;
      mockPrisma.bidItems.update.mockRejectedValue(new Error('Database error'));

      const result = await bidItemRepository.delete(bidItemId);
      
      expect(result).toBe(false);
    });
  });
});
