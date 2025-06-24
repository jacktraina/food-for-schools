import { inject, injectable } from 'inversify';
import TYPES from '../../shared/dependencyInjection/types';
import { IDashboardService, DashboardMetrics } from '../contracts/IDashboardService';
import { IBidRepository } from '../../domain/interfaces/Bids/IBidRepository';
import { IVendorRepository } from '../../domain/interfaces/vendors/IVendorRepository';
import { IDistrictRepository } from '../../domain/interfaces/Districts/IDistrictRepository';
import { IUserRepository } from '../../domain/interfaces/users/IUserRepository';

@injectable()
export class DashboardService implements IDashboardService {
  constructor(
    @inject(TYPES.IBidRepository) private bidRepository: IBidRepository,
    @inject(TYPES.IVendorRepository) private vendorRepository: IVendorRepository,
    @inject(TYPES.IDistrictRepository) private districtRepository: IDistrictRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async getDashboardMetrics(user: { id: number; cooperativeId?: number | null; districtId?: number | null }): Promise<DashboardMetrics> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      let organizationFilter: { cooperativeId?: number; districtId?: number } = {};
      
      if (user.cooperativeId && user.districtId) {
        organizationFilter = { cooperativeId: user.cooperativeId };
      } else if (user.cooperativeId) {
        organizationFilter = { cooperativeId: user.cooperativeId };
      } else if (user.districtId) {
        organizationFilter = { districtId: user.districtId };
      }

      const hasOrganizationFilter = Object.keys(organizationFilter).length > 0;

      const [
        activeBids, 
        pendingApprovals,
        activeBidsLastMonth,
        pendingApprovalsLastWeek
      ] = await Promise.all([
        hasOrganizationFilter ? this.bidRepository.countActiveByOrganization(organizationFilter) : this.bidRepository.countActive(),
        hasOrganizationFilter ? this.vendorRepository.countPendingApprovalsByOrganization(organizationFilter) : this.vendorRepository.countPendingApprovals(),
        hasOrganizationFilter ? this.bidRepository.countActiveSinceByOrganization(thirtyDaysAgo, organizationFilter) : this.bidRepository.countActiveSince(thirtyDaysAgo),
        hasOrganizationFilter ? this.vendorRepository.countPendingApprovalsSinceByOrganization(sevenDaysAgo, organizationFilter) : this.vendorRepository.countPendingApprovalsSince(sevenDaysAgo)
      ]);

    const activeBidsChange = activeBidsLastMonth > 0 ? `+${activeBidsLastMonth} from last month` : 'No change from last month';
    const pendingApprovalsChange = pendingApprovalsLastWeek > 0 ? `-${pendingApprovalsLastWeek} from last week` : 'No change from last week';

    const baseMetrics = {
      active_bids: activeBids,
      pending_approvals: pendingApprovals,
      active_bids_change: activeBidsChange,
      pending_approvals_change: pendingApprovalsChange
    };

      if (user?.cooperativeId) {
        const [memberDistricts, memberDistrictsLastMonth] = await Promise.all([
          this.districtRepository.countByCooperativeId(user.cooperativeId),
          this.districtRepository.countByCooperativeIdSince(user.cooperativeId, thirtyDaysAgo)
        ]);
        
        const memberDistrictsChange = memberDistrictsLastMonth > 0 ? `+${memberDistrictsLastMonth} new this month` : 'No new districts this month';
        
        return {
          ...baseMetrics,
          member_districts: memberDistricts,
          vendors_or_districts_change: memberDistrictsChange
        };
      } else {
        const [activeVendors, activeVendorsLastMonth] = await Promise.all([
          hasOrganizationFilter ? this.vendorRepository.countActiveByOrganization(organizationFilter) : this.vendorRepository.countActive(),
          hasOrganizationFilter ? this.vendorRepository.countActiveSinceByOrganization(thirtyDaysAgo, organizationFilter) : this.vendorRepository.countActiveSince(thirtyDaysAgo)
        ]);
        
        const activeVendorsChange = activeVendorsLastMonth > 0 ? `+${activeVendorsLastMonth} new this month` : 'No new vendors this month';
        
        return {
          ...baseMetrics,
          active_vendors: activeVendors,
          vendors_or_districts_change: activeVendorsChange
        };
      }
    } catch (error) {
      console.error('Error in getDashboardMetrics:', error);
      throw error;
    }
  }

  hasValidRole(userRoles: Array<{ role?: { name?: string } }> | undefined): boolean {
    const validRoles = ['Group Admin', 'District Admin', 'School Admin', 'Viewer'];
    
    if (!userRoles || !Array.isArray(userRoles)) {
      return false;
    }
    
    const roles = userRoles
      .map((ur) => ur?.role?.name ?? null)
      .filter((role) => role !== null);
    
    return roles.some(role => validRoles.includes(role));
  }
}
