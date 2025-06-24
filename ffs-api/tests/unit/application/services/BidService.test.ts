import { BidService } from '../../../../src/application/services/BidService';
import { IBidRepository } from '../../../../src/domain/interfaces/Bids/IBidRepository';
import { Bid } from '../../../../src/domain/interfaces/Bids/Bid';
import { UpdateBidRequest } from '../../../../src/interfaces/requests/bids/UpdateBidRequest';
import { NotFoundError } from '../../../../src/domain/core/errors/NotFoundError';

describe('BidService', () => {
  const mockBidRepository: jest.Mocked<IBidRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findByScope: jest.fn(),
    findByBidManager: jest.fn(),
    findByDistrictId: jest.fn(),
    findByCooperativeId: jest.fn(),
    findPaginated: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    countActive: jest.fn(),
    countActiveSince: jest.fn(),
    countActiveByOrganization: jest.fn(),
    countActiveSinceByOrganization: jest.fn(),
  };

  let service: BidService;

  beforeEach(() => {
    service = new BidService(mockBidRepository);
    jest.clearAllMocks();
  });

  describe('createBid', () => {
    it('should create a bid successfully', async () => {
      const request = {
        name: 'Test Bid',
        bidYear: '2024',
        status: 'In Process',
      };

      const mockBid = new Bid({
        id: 1,
        code: 'BID-001',
        name: 'Test Bid',
        bidYear: '2024',
        status: 'In Process',
      });

      mockBidRepository.create.mockResolvedValue(mockBid);

      const result = await service.createBid(request);

      expect(mockBidRepository.create).toHaveBeenCalledWith(
        expect.any(Bid)
      );
      expect(result).toBe(mockBid);
    });
  });

  describe('getBidById', () => {
    it('should return a bid when found', async () => {
      const mockBid = new Bid({
        id: 1,
        code: 'BID-001',
        name: 'Test Bid',
        bidYear: '2024',
        status: 'In Process',
      });

      mockBidRepository.findById.mockResolvedValue(mockBid);

      const result = await service.getBidById(1);

      expect(mockBidRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toBe(mockBid);
    });

    it('should throw NotFoundError when bid not found', async () => {
      mockBidRepository.findById.mockResolvedValue(null);

      await expect(service.getBidById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllBids', () => {
    it('should return all bids', async () => {
      const mockBids = [
        new Bid({
          id: 1,
          code: 'BID-001',
          name: 'Test Bid 1',
          bidYear: '2024',
          status: 'In Process',
        }),
        new Bid({
          id: 2,
          code: 'BID-002',
          name: 'Test Bid 2',
          bidYear: '2024',
          status: 'Awarded',
        }),
      ];

      mockBidRepository.findAll.mockResolvedValue(mockBids);

      const result = await service.getAllBids();

      expect(mockBidRepository.findAll).toHaveBeenCalled();
      expect(result).toBe(mockBids);
    });
  });



  describe('getBidsByBidManager', () => {
    it('should return bids for the specified bid manager', async () => {
      const mockBids = [
        new Bid({
          id: 1,
          code: 'BID-001',
          name: 'Test Bid',
          bidYear: '2024',
          status: 'In Process',
        }),
      ];

      mockBidRepository.findByBidManager.mockResolvedValue(mockBids);

      const result = await service.getBidsForBidManager(1);

      expect(mockBidRepository.findByBidManager).toHaveBeenCalledWith(1);
      expect(result).toBe(mockBids);
    });
  });

  describe('updateBid', () => {
    it('should update a bid successfully', async () => {
      const request = {
        name: 'Updated Bid',
        status: 'Awarded',
      };

      const existingBid = new Bid({
        id: 1,
        code: 'BID-001',
        name: 'Test Bid',
        bidYear: '2024',
        status: 'In Process',
      });

      const updatedBid = new Bid({
        id: 1,
        code: 'BID-001',
        name: 'Updated Bid',
        bidYear: '2024',
        status: 'Awarded',
      });

      mockBidRepository.findById.mockResolvedValue(existingBid);
      mockBidRepository.update.mockResolvedValue(updatedBid);

      const result = await service.updateBid(1, request);

      expect(mockBidRepository.findById).toHaveBeenCalledWith(1);
      expect(mockBidRepository.update).toHaveBeenCalledWith(
        expect.any(Bid)
      );
      expect(result).toBe(updatedBid);
    });

    it('should throw NotFoundError when bid not found', async () => {
      const request = {
        name: 'Updated Bid',
      };

      mockBidRepository.findById.mockResolvedValue(null);

      await expect(service.updateBid(999, request)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteBid', () => {
    it('should soft delete a bid successfully', async () => {
      const existingBid = new Bid({
        id: 1,
        code: 'BID-001',
        name: 'Test Bid',
        bidYear: '2024',
        status: 'In Process',
      });

      mockBidRepository.findById.mockResolvedValue(existingBid);
      mockBidRepository.softDelete.mockResolvedValue(undefined);

      const result = await service.deleteBid(1);

      expect(mockBidRepository.findById).toHaveBeenCalledWith(1);
      expect(mockBidRepository.softDelete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundError when bid not found', async () => {
      mockBidRepository.findById.mockResolvedValue(null);

      await expect(service.deleteBid(999)).rejects.toThrow(NotFoundError);
    });
  });


});
