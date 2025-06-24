import { UserFilters } from '@/components/dashboard/user-filters-modal';
import { LoginResponseUser } from '@/types/auth';

export function cn(...inputs: any[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function hasRole(
  user: LoginResponseUser,
  roleType: string,
  scopeType?: string,
  scopeId?: string
): boolean {
  return user.roles.some((role) => {
    if (role.type !== roleType) return false;
    if (scopeType && role.scope.type !== scopeType) return false;
    if (scopeId && role.scope.id.toString() !== scopeId) return false;
    return true;
  });
}

export function buildUserQueryParams({
  search,
  filters,
}: {
  search: string;
  filters: UserFilters;
}) {
  const params = new URLSearchParams();

  if (search) params.append('search', search);
  if (filters.role && filters.role !== 'all')
    params.append('role', filters.role);
  if (filters.bidRole && filters.bidRole !== 'all')
    params.append('bidRole', filters.bidRole);
  if (filters.district && filters.district !== 'all')
    params.append('district', filters.district);
  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }

  return params.toString();
}
