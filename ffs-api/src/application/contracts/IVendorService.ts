export interface IVendorService {
  registerVendor(
    companyName: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    organizationId: number,
    organizationType: 'cooperative' | 'district'
  ): Promise<{ message: string; vendorId: number }>;

  getTopLevelOrganizations(): Promise<Array<{ id: number; name: string; type: 'cooperative' | 'district' }>>;
}
