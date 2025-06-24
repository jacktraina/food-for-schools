import { VendorOrganizationApproval } from '../../../../../src/domain/interfaces/VendorOrganizationApprovals/VendorOrganizationApprovals';
import { Vendor } from '../../../../../src/domain/interfaces/vendors/Vendor';
import { VendorStatus } from '../../../../../src/domain/interfaces/vendorStatuses/VendorStatus';

describe('VendorOrganizationApproval', () => {
  let mockVendor: Vendor;
  let mockVendorStatus: VendorStatus;

  beforeEach(() => {
    mockVendorStatus = new VendorStatus({
      id: 1,
      name: 'Active'
    });

    mockVendor = new Vendor({
      id: 1,
      name: 'Test Vendor',
      email: 'vendor@test.com',
      statusId: 1,
      isDeleted: false,
      vendorStatus: mockVendorStatus
    });
  });

  describe('constructor', () => {
    it('should create VendorOrganizationApproval with all properties', () => {
      const approval = new VendorOrganizationApproval({
        id: 1,
        vendorId: 1,
        statusId: 1,
        cooperativeId: 1,
        districtId: 1,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        vendor: mockVendor,
        vendorStatus: mockVendorStatus
      });

      expect(approval.id).toBe(1);
      expect(approval.vendorId).toBe(1);
      expect(approval.statusId).toBe(1);
      expect(approval.cooperativeId).toBe(1);
      expect(approval.districtId).toBe(1);
      expect(approval.vendor).toBe(mockVendor);
      expect(approval.vendorStatus).toBe(mockVendorStatus);
    });

    it('should create VendorOrganizationApproval with default null values', () => {
      const approval = new VendorOrganizationApproval({
        id: 1,
        vendorId: 1,
        statusId: 2,
        vendor: mockVendor,
        vendorStatus: mockVendorStatus
      });

      expect(approval.cooperativeId).toBeNull();
      expect(approval.districtId).toBeNull();
      expect(approval.createdAt).toBeNull();
      expect(approval.updatedAt).toBeNull();
      expect(approval.cooperative).toBeNull();
      expect(approval.district).toBeNull();
    });
  });

  describe('isActive', () => {
    it('should return true when statusId is 1', () => {
      const approval = new VendorOrganizationApproval({
        id: 1,
        vendorId: 1,
        statusId: 1,
        vendor: mockVendor,
        vendorStatus: mockVendorStatus
      });

      expect(approval.isActive()).toBe(true);
    });

    it('should return false when statusId is not 1', () => {
      const approval = new VendorOrganizationApproval({
        id: 1,
        vendorId: 1,
        statusId: 2,
        vendor: mockVendor,
        vendorStatus: mockVendorStatus
      });

      expect(approval.isActive()).toBe(false);
    });

    it('should return false when statusId is 0', () => {
      const approval = new VendorOrganizationApproval({
        id: 1,
        vendorId: 1,
        statusId: 0,
        vendor: mockVendor,
        vendorStatus: mockVendorStatus
      });

      expect(approval.isActive()).toBe(false);
    });
  });
});
