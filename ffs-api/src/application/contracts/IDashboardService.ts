export interface DashboardMetrics {
  active_bids: number;
  pending_approvals: number;
  active_vendors?: number;
  member_districts?: number;
  active_bids_change: string;
  pending_approvals_change: string;
  vendors_or_districts_change: string;
}

export interface IDashboardService {
  getDashboardMetrics(user: { id: number; cooperativeId?: number | null; districtId?: number | null }): Promise<DashboardMetrics>;
  hasValidRole(userRoles: Array<{ role?: { name?: string } }> | undefined): boolean;
}
