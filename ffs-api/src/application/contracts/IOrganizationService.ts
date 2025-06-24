export interface InviteOrganizationData {
  email: string;
  organization_type: string;
  name: string;
}

export interface UpdateOrganizationData {
  streetAddress1?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface IOrganizationService {
  inviteOrganization(data: InviteOrganizationData, invitedBy: number): Promise<{ message: string }>;
  updateOrganization(id: number, data: UpdateOrganizationData, updatedBy: number): Promise<{ message: string }>;
}
