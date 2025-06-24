import apiClient from './client';

export interface VendorRegistrationData {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationId: number;
  organizationType: 'cooperative' | 'district';
}

export interface VendorRegistrationResponse {
  message: string;
  vendorId: number;
}

export interface Organization {
  id: number;
  name: string;
  type: 'cooperative' | 'district';
}

export const registerVendor = async (data: VendorRegistrationData): Promise<VendorRegistrationResponse> => {
  const response = await apiClient.post<VendorRegistrationResponse>('/vendors/register', data);
  return response.data;
};

export const getVendorOrganizations = async (): Promise<Organization[]> => {
  const response = await apiClient.get<{ organizations: Organization[] }>('/vendors/organizations');
  return response.data.organizations;
};
