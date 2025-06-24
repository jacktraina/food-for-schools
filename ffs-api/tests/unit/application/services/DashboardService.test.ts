import { DashboardService } from '../../../../src/application/services/DashboardService';
import { IBidRepository } from '../../../../src/domain/interfaces/Bids/IBidRepository';
import { IVendorRepository } from '../../../../src/domain/interfaces/vendors/IVendorRepository';
import { IDistrictRepository } from '../../../../src/domain/interfaces/Districts/IDistrictRepository';
import { IUserRepository } from '../../../../src/domain/interfaces/users/IUserRepository';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let mockBidRepository: jest.Mocked<IBidRepository>;
  let mockVendorRepository: jest.Mocked<IVendorRepository>;
  let mockDistrictRepository: jest.Mocked<IDistrictRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockBidRepository = {
      countActive: jest.fn(),
      countActiveSince: jest.fn(),
      countActiveByOrganization: jest.fn(),
      countActiveSinceByOrganization: jest.fn()
    } as any;

    mockVendorRepository = {
      countActive: jest.fn(),
      countActiveSince: jest.fn(),
      countPendingApprovals: jest.fn(),
      countPendingApprovalsSince: jest.fn(),
      countActiveByOrganization: jest.fn(),
      countActiveSinceByOrganization: jest.fn(),
      countPendingApprovalsByOrganization: jest.fn(),
      countPendingApprovalsSinceByOrganization: jest.fn()
    } as any;

    mockDistrictRepository = {
      countByCooperativeId: jest.fn(),
      countByCooperativeIdSince: jest.fn()
    } as any;

    mockUserRepository = {
      getUserDetails: jest.fn()
    } as any;

    dashboardService = new DashboardService(
      mockBidRepository, 
      mockVendorRepository, 
      mockDistrictRepository, 
      mockUserRepository
    );
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics with active_vendors for district users', async () => {
      const user = {
        id: 1,
        cooperativeId: null,
        districtId: null
      };
      mockBidRepository.countActive.mockResolvedValue(5);
      mockBidRepository.countActiveSince.mockResolvedValue(2);
      mockVendorRepository.countActive.mockResolvedValue(10);
      mockVendorRepository.countActiveSince.mockResolvedValue(4);
      mockVendorRepository.countPendingApprovals.mockResolvedValue(3);
      mockVendorRepository.countPendingApprovalsSince.mockResolvedValue(1);

      const result = await dashboardService.getDashboardMetrics(user);

      expect(result).toEqual({
        active_bids: 5,
        pending_approvals: 3,
        active_vendors: 10,
        active_bids_change: '+2 from last month',
        pending_approvals_change: '-1 from last week',
        vendors_or_districts_change: '+4 new this month'
      });
      expect(mockBidRepository.countActive).toHaveBeenCalled();
      expect(mockVendorRepository.countActive).toHaveBeenCalled();
      expect(mockVendorRepository.countPendingApprovals).toHaveBeenCalled();
    });

    it('should return dashboard metrics with member_districts for cooperative users', async () => {
      const cooperativeId = 5;
      const user = {
        id: 1,
        cooperativeId: cooperativeId,
        districtId: null
      };
      mockBidRepository.countActiveByOrganization.mockResolvedValue(5);
      mockBidRepository.countActiveSinceByOrganization.mockResolvedValue(3);
      mockVendorRepository.countPendingApprovalsByOrganization.mockResolvedValue(3);
      mockVendorRepository.countPendingApprovalsSinceByOrganization.mockResolvedValue(0);
      mockDistrictRepository.countByCooperativeId.mockResolvedValue(8);
      mockDistrictRepository.countByCooperativeIdSince.mockResolvedValue(1);

      const result = await dashboardService.getDashboardMetrics(user);

      expect(result).toEqual({
        active_bids: 5,
        pending_approvals: 3,
        member_districts: 8,
        active_bids_change: '+3 from last month',
        pending_approvals_change: 'No change from last week',
        vendors_or_districts_change: '+1 new this month'
      });
      expect(mockBidRepository.countActiveByOrganization).toHaveBeenCalledWith({ cooperativeId });
      expect(mockVendorRepository.countPendingApprovalsByOrganization).toHaveBeenCalledWith({ cooperativeId });
      expect(mockDistrictRepository.countByCooperativeId).toHaveBeenCalledWith(cooperativeId);
    });
  });

  describe('hasValidRole', () => {
    it('should return true when user has Group Admin role', () => {
      const userRoles = [{ role: { name: 'Group Admin' } }];

      const result = dashboardService.hasValidRole(userRoles);

      expect(result).toBe(true);
    });

    it('should return true when user has District Admin role', () => {
      const userRoles = [{ role: { name: 'District Admin' } }];

      const result = dashboardService.hasValidRole(userRoles);

      expect(result).toBe(true);
    });

    it('should return true when user has School Admin role', () => {
      const userRoles = [{ role: { name: 'School Admin' } }];

      const result = dashboardService.hasValidRole(userRoles);

      expect(result).toBe(true);
    });

    it('should return true when user has Viewer role', () => {
      const userRoles = [{ role: { name: 'Viewer' } }];

      const result = dashboardService.hasValidRole(userRoles);

      expect(result).toBe(true);
    });

    it('should return false when user has no valid roles', () => {
      const userRoles = [{ role: { name: 'Other Role' } }];

      const result = dashboardService.hasValidRole(userRoles);

      expect(result).toBe(false);
    });

    it('should return false when user has no roles', () => {
      const userRoles: Array<{ role?: { name?: string } }> = [];

      const result = dashboardService.hasValidRole(userRoles);

      expect(result).toBe(false);
    });

    it('should handle null or undefined role names', () => {
      const userRoles = [{ role: { name: undefined } }, { role: undefined }, {}];

      const result = dashboardService.hasValidRole(userRoles);

      expect(result).toBe(false);
    });
  });
});
