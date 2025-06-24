import { BidManagerRepository } from '../../../../src/infrastructure/repositories/BidManagerRepository';
import { BidManager } from '../../../../src/domain/interfaces/BidManagers/BidManager';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    bidManagers: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('BidManagerRepository', () => {
  let bidManagerRepository: BidManagerRepository;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    bidManagerRepository = new BidManagerRepository();
    mockPrisma = (bidManagerRepository as any).prisma;
  });

  describe('findAll', () => {
    it('should return all bid managers as BidManager instances', async () => {
      const mockBidManagers = [
        { id: 1, userId: 1, bidId: 1, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, userId: 2, bidId: 2, createdAt: new Date(), updatedAt: new Date() }
      ];
      
      mockPrisma.bidManagers.findMany.mockResolvedValue(mockBidManagers);

      const result = await bidManagerRepository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(BidManager);
      expect(mockPrisma.bidManagers.findMany).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockPrisma.bidManagers.findMany.mockRejectedValue(new Error('Database error'));

      await expect(bidManagerRepository.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return bid manager when found', async () => {
      const mockBidManager = { 
        id: 1, 
        userId: 1, 
        bidId: 1, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      mockPrisma.bidManagers.findUnique.mockResolvedValue(mockBidManager);

      const result = await bidManagerRepository.findById(1);

      expect(result).toBeInstanceOf(BidManager);
      expect(mockPrisma.bidManagers.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('should return null when not found', async () => {
      mockPrisma.bidManagers.findUnique.mockResolvedValue(null);

      const result = await bidManagerRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create bid manager successfully', async () => {
      const bidManagerData = new BidManager({
        id: 0,
        userId: 1,
        bidId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const mockCreatedBidManager = {
        id: 1,
        userId: 1,
        bidId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.bidManagers.create.mockResolvedValue(mockCreatedBidManager);

      const result = await bidManagerRepository.create(bidManagerData);

      expect(result).toBeInstanceOf(BidManager);
      expect(mockPrisma.bidManagers.create).toHaveBeenCalledWith({
        data: {
          userId: bidManagerData.userId,
          bidId: bidManagerData.bidId,
          createdAt: expect.any(Date)
        }
      });
    });

    it('should handle creation errors', async () => {
      const bidManagerData = new BidManager({
        id: 0,
        userId: 1,
        bidId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      mockPrisma.bidManagers.create.mockRejectedValue(new Error('Creation failed'));

      await expect(bidManagerRepository.create(bidManagerData)).rejects.toThrow('Creation failed');
    });
  });

  describe('update', () => {
    it('should update bid manager successfully', async () => {
      const updateData = new BidManager({
        id: 1,
        userId: 2,
        bidId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const mockUpdatedBidManager = {
        id: 1,
        userId: 2,
        bidId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.bidManagers.update.mockResolvedValue(mockUpdatedBidManager);

      const result = await bidManagerRepository.update(updateData);

      expect(result).toBeInstanceOf(BidManager);
      expect(mockPrisma.bidManagers.update).toHaveBeenCalledWith({
        where: { id: updateData.id },
        data: {
          userId: updateData.userId,
          bidId: updateData.bidId
        }
      });
    });

    it('should handle update errors', async () => {
      const updateData = new BidManager({
        id: 1,
        userId: 2,
        bidId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      mockPrisma.bidManagers.update.mockRejectedValue(new Error('Update failed'));

      await expect(bidManagerRepository.update(updateData)).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete bid manager successfully', async () => {
      mockPrisma.bidManagers.delete.mockResolvedValue({ id: 1 });

      await bidManagerRepository.delete(1);

      expect(mockPrisma.bidManagers.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('should handle deletion errors', async () => {
      mockPrisma.bidManagers.delete.mockRejectedValue(new Error('Deletion failed'));

      const result = await bidManagerRepository.delete(1);
      expect(result).toBe(false);
    });
  });
});
