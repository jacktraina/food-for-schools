import { VendorRepository } from '../../../../src/infrastructure/repositories/VendorRepository';

const mockVendorModel = {
  count: jest.fn(),
};

const mockVendorOrganizationApprovalModel = {
  count: jest.fn(),
};

const mockPrisma = {
  vendor: mockVendorModel,
  vendorOrganizationApproval: mockVendorOrganizationApprovalModel,
};

const mockDatabaseService = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  runInTransaction: jest.fn(),
  getClient: jest.fn().mockReturnValue(mockPrisma),
};

describe('VendorRepository', () => {
  let vendorRepository: VendorRepository;

  beforeEach(() => {
    vendorRepository = new VendorRepository(mockDatabaseService as any);
    jest.clearAllMocks();
  });

  describe('countActive', () => {
    it('should return count of active vendors', async () => {
      mockVendorModel.count.mockResolvedValue(5);

      const result = await vendorRepository.countActive();

      expect(result).toBe(5);
      expect(mockVendorModel.count).toHaveBeenCalledWith({
        where: {
          statusId: 1,
          isDeleted: false
        }
      });
    });

    it('should handle database errors', async () => {
      mockVendorModel.count.mockRejectedValue(new Error('Database error'));

      await expect(vendorRepository.countActive()).rejects.toThrow('Database error');
    });
  });

  describe('countPendingApprovals', () => {
    it('should return count of pending vendor approvals', async () => {
      mockVendorOrganizationApprovalModel.count.mockResolvedValue(3);

      const result = await vendorRepository.countPendingApprovals();

      expect(result).toBe(3);
      expect(mockVendorOrganizationApprovalModel.count).toHaveBeenCalledWith({
        where: {
          statusId: 3
        }
      });
    });

    it('should handle database errors for pending approvals', async () => {
      mockVendorOrganizationApprovalModel.count.mockRejectedValue(new Error('Database error'));

      await expect(vendorRepository.countPendingApprovals()).rejects.toThrow('Database error');
    });
  });
});
