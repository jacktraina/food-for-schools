export interface OrganizationsResponse {
  organizations: Array<{
    id: number;
    name: string;
    type: 'cooperative' | 'district';
  }>;
}
