import { Vendor } from './Vendor';

export interface IVendorRepository {
  countActive(): Promise<number>;
  countActiveSince(date: Date): Promise<number>;
  countActiveByOrganization(params: { cooperativeId?: number; districtId?: number }): Promise<number>;
  countActiveSinceByOrganization(date: Date, params: { cooperativeId?: number; districtId?: number }): Promise<number>;
  countPendingApprovals(): Promise<number>;
  countPendingApprovalsSince(date: Date): Promise<number>;
  countPendingApprovalsByOrganization(params: { cooperativeId?: number; districtId?: number }): Promise<number>;
  countPendingApprovalsSinceByOrganization(date: Date, params: { cooperativeId?: number; districtId?: number }): Promise<number>;
  create(vendor: Vendor): Promise<Vendor>;
  findByEmail(email: string): Promise<Vendor | null>;
}
