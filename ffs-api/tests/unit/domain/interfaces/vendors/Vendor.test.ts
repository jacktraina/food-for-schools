import { Vendor } from '../../../../../src/domain/interfaces/vendors/Vendor';
import { VendorStatus } from '../../../../../src/domain/interfaces/vendorStatuses/VendorStatus';

describe('Vendor', () => {
  const mockVendorStatus = new VendorStatus({
    id: 1,
    name: 'Active'
  });

  describe('constructor', () => {
    it('should create a vendor with all properties', () => {
      const vendorProps = {
        id: 1,
        email: 'vendor@example.com',
        name: 'Test Vendor',
        cooperativeId: 1,
        districtId: null,
        statusId: 1,
        registeredAt: new Date(),
        isDeleted: false,
        vendorStatus: mockVendorStatus,
        vendorOrganizationApprovals: []
      };

      const vendor = new Vendor(vendorProps);

      expect(vendor.id).toBe(1);
      expect(vendor.email).toBe('vendor@example.com');
      expect(vendor.name).toBe('Test Vendor');
      expect(vendor.cooperativeId).toBe(1);
      expect(vendor.districtId).toBeNull();
      expect(vendor.statusId).toBe(1);
      expect(vendor.isDeleted).toBe(false);
      expect(vendor.vendorStatus).toBe(mockVendorStatus);
      expect(vendor.vendorOrganizationApprovals).toEqual([]);
    });

    it('should create a vendor with default values', () => {
      const vendorProps = {
        id: 1,
        email: 'vendor@example.com',
        name: 'Test Vendor',
        statusId: 1,
        isDeleted: false,
        vendorStatus: mockVendorStatus
      };

      const vendor = new Vendor(vendorProps);

      expect(vendor.cooperativeId).toBeNull();
      expect(vendor.districtId).toBeNull();
      expect(vendor.statusId).toBe(1);
      expect(vendor.registeredAt).toBeNull();
      expect(vendor.isDeleted).toBe(false);
      expect(vendor.vendorOrganizationApprovals).toEqual([]);
    });
  });

  describe('isActive', () => {
    it('should return true when vendor is active and not deleted', () => {
      const vendor = new Vendor({
        id: 1,
        email: 'vendor@example.com',
        name: 'Test Vendor',
        statusId: 1,
        isDeleted: false,
        vendorStatus: mockVendorStatus
      });

      expect(vendor.isActive()).toBe(true);
    });

    it('should return false when vendor is deleted', () => {
      const vendor = new Vendor({
        id: 1,
        email: 'vendor@example.com',
        name: 'Test Vendor',
        statusId: 1,
        isDeleted: true,
        vendorStatus: mockVendorStatus
      });

      expect(vendor.isActive()).toBe(false);
    });

    it('should return false when vendor status is not active', () => {
      const vendor = new Vendor({
        id: 1,
        email: 'vendor@example.com',
        name: 'Test Vendor',
        statusId: 2,
        isDeleted: false,
        vendorStatus: mockVendorStatus
      });

      expect(vendor.isActive()).toBe(false);
    });

    it('should return false when vendor is deleted and status is not active', () => {
      const vendor = new Vendor({
        id: 1,
        email: 'vendor@example.com',
        name: 'Test Vendor',
        statusId: 2,
        isDeleted: true,
        vendorStatus: mockVendorStatus
      });

      expect(vendor.isActive()).toBe(false);
    });

    it('should return false when statusId is 0', () => {
      const vendor = new Vendor({
        id: 1,
        email: 'vendor@example.com',
        name: 'Test Vendor',
        statusId: 0,
        isDeleted: false,
        vendorStatus: mockVendorStatus
      });

      expect(vendor.isActive()).toBe(false);
    });
  });

  describe('constructor default values', () => {
    it('should use default values when optional properties are not provided', () => {
      const vendor = new Vendor({
        id: 1,
        email: 'vendor@example.com',
        name: 'Test Vendor',
        statusId: 1,
        vendorStatus: mockVendorStatus,
        isDeleted: false
      });

      expect(vendor.cooperativeId).toBeNull();
      expect(vendor.districtId).toBeNull();
      expect(vendor.statusId).toBe(1);
      expect(vendor.registeredAt).toBeNull();
      expect(vendor.isDeleted).toBe(false);
      expect(vendor.vendorOrganizationApprovals).toEqual([]);
    });

    it('should override default values when properties are explicitly provided', () => {
      const customDate = new Date('2023-01-01');
      const vendor = new Vendor({
        id: 1,
        email: 'vendor@example.com',
        name: 'Test Vendor',
        cooperativeId: 5,
        districtId: 10,
        statusId: 2,
        registeredAt: customDate,
        isDeleted: true,
        vendorStatus: mockVendorStatus,
        vendorOrganizationApprovals: []
      });

      expect(vendor.cooperativeId).toBe(5);
      expect(vendor.districtId).toBe(10);
      expect(vendor.statusId).toBe(2);
      expect(vendor.registeredAt).toBe(customDate);
      expect(vendor.isDeleted).toBe(true);
    });
  });
});
