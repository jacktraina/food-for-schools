import { School } from '../../../../../src/domain/interfaces/Schools/School';
import { District } from '../../../../../src/domain/interfaces/Districts/District';
import { UserStatus } from '../../../../../src/domain/interfaces/userStatuses/UserStatus';

describe('School', () => {
  const mockDistrict = new District({
    id: 1,
    name: 'Test District',
    statusId: 1
  });

  const mockUserStatus = new UserStatus({
    id: 1,
    name: 'Active'
  });

  describe('constructor', () => {
    it('should create School with required properties', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary'
      });

      expect(school.districtId).toBe(1);
      expect(school.name).toBe('Test School');
      expect(school.schoolType).toBe('Elementary');
      expect(school.statusId).toBe(1);

      expect(school.isDeleted).toBe(false);
      expect(school.overrideDistrictBilling).toBe(false);
    });

    it('should create School with all properties', () => {
      const school = new School({
        id: 1,
        districtId: 1,
        name: 'Test School',
        enrollment: 500,
        schoolType: 'Elementary',
        addressLine1: '123 Main St',
        addressLine2: 'Suite 100',
        city: 'Test City',
        state: 'TX',
        zipCode: '12345',
        shippingAddressLine1: '456 Oak St',
        shippingAddressLine2: 'Building A',
        shippingAddressCity: 'Shipping City',
        shippingAddressState: 'CA',
        shippingAddressZipCode: '67890',
        notes: 'Test notes',
        overrideDistrictBilling: true,
        statusId: 2,

        isDeleted: false,
        code: 'TST001',
        location: 'North Campus',
        directorName: 'John Director',
        raNumber: 'RA123',
        superintendent: 'Jane Super',
        established: 1995,
        budget: 1000000,
        participatingIn: 'Program A',
        website: 'https://testschool.edu',
        description: 'A test school',
        logo: 'logo.png',
        fax: '555-0123',
        districts: mockDistrict,
        userStatuses: mockUserStatus
      });

      expect(school.id).toBe(1);
      expect(school.enrollment).toBe(500);
      expect(school.addressLine1).toBe('123 Main St');
      expect(school.overrideDistrictBilling).toBe(true);
      expect(school.statusId).toBe(2);

    });

    it('should use default values for optional properties', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary'
      });

      expect(school.enrollment).toBeNull();
      expect(school.addressLine1).toBeNull();
      expect(school.addressLine2).toBeNull();
      expect(school.city).toBeNull();
      expect(school.state).toBeNull();
      expect(school.zipCode).toBeNull();
      expect(school.notes).toBeNull();
      expect(school.overrideDistrictBilling).toBe(false);
      expect(school.statusId).toBe(1);

      expect(school.isDeleted).toBe(false);
      expect(school.code).toBeNull();
    });
  });

  describe('validation', () => {
    it('should throw error for empty name', () => {
      expect(() => new School({
        districtId: 1,
        name: '',
        schoolType: 'Elementary'
      })).toThrow('School name is required and cannot be empty');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => new School({
        districtId: 1,
        name: '   ',
        schoolType: 'Elementary'
      })).toThrow('School name is required and cannot be empty');
    });

    it('should throw error for name exceeding 255 characters', () => {
      const longName = 'a'.repeat(256);
      expect(() => new School({
        districtId: 1,
        name: longName,
        schoolType: 'Elementary'
      })).toThrow('School name cannot exceed 255 characters');
    });

    it('should throw error for missing districtId', () => {
      expect(() => new School({
        districtId: 0,
        name: 'Test School',
        schoolType: 'Elementary'
      })).toThrow('District ID is required and must be a positive number');
    });

    it('should throw error for negative districtId', () => {
      expect(() => new School({
        districtId: -1,
        name: 'Test School',
        schoolType: 'Elementary'
      })).toThrow('District ID is required and must be a positive number');
    });

    it('should throw error for empty schoolType', () => {
      expect(() => new School({
        districtId: 1,
        name: 'Test School',
        schoolType: ''
      })).toThrow('School type is required and cannot be empty');
    });

    it('should throw error for whitespace-only schoolType', () => {
      expect(() => new School({
        districtId: 1,
        name: 'Test School',
        schoolType: '   '
      })).toThrow('School type is required and cannot be empty');
    });
  });

  describe('fullAddress getter', () => {
    it('should return formatted address with all components', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary',
        addressLine1: '123 Main St',
        addressLine2: 'Suite 100',
        city: 'Test City',
        state: 'TX',
        zipCode: '12345'
      });

      expect(school.fullAddress).toBe('123 Main St, Suite 100, Test City, TX, 12345');
    });

    it('should return formatted address with partial components', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary',
        addressLine1: '123 Main St',
        city: 'Test City',
        state: 'TX'
      });

      expect(school.fullAddress).toBe('123 Main St, Test City, TX');
    });

    it('should return empty string when no address components', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary'
      });

      expect(school.fullAddress).toBe('');
    });

    it('should filter out empty and whitespace-only components', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary',
        addressLine1: '123 Main St',
        addressLine2: '',
        city: '   ',
        state: 'TX',
        zipCode: '12345'
      });

      expect(school.fullAddress).toBe('123 Main St, TX, 12345');
    });
  });

  describe('shippingFullAddress getter', () => {
    it('should return formatted shipping address with all components', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary',
        shippingAddressLine1: '456 Oak St',
        shippingAddressLine2: 'Building A',
        shippingAddressCity: 'Shipping City',
        shippingAddressState: 'CA',
        shippingAddressZipCode: '67890'
      });

      expect(school.shippingFullAddress).toBe('456 Oak St, Building A, Shipping City, CA, 67890');
    });

    it('should return empty string when no shipping address components', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary'
      });

      expect(school.shippingFullAddress).toBe('');
    });

    it('should filter out empty shipping address components', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary',
        shippingAddressLine1: '456 Oak St',
        shippingAddressLine2: '',
        shippingAddressCity: 'Shipping City',
        shippingAddressState: '',
        shippingAddressZipCode: '67890'
      });

      expect(school.shippingFullAddress).toBe('456 Oak St, Shipping City, 67890');
    });
  });

  describe('status getters', () => {
    it('should return true for isActive when statusId is 1', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary',
        statusId: 1
      });

      expect(school.isActive).toBe(true);
    });

    it('should return false for isActive when statusId is not 1', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary',
        statusId: 2
      });

      expect(school.isActive).toBe(false);
    });

    it('should return true for isPending when statusId is 3', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary',
        statusId: 3
      });

      expect(school.isPending).toBe(true);
    });

    it('should return false for isPending when statusId is not 3', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary',
        statusId: 1
      });

      expect(school.isPending).toBe(false);
    });

    it('should return true for isInactive when statusId is 2', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary',
        statusId: 2
      });

      expect(school.isInactive).toBe(true);
    });

    it('should return false for isInactive when statusId is not 2', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary',
        statusId: 1
      });

      expect(school.isInactive).toBe(false);
    });
  });

  describe('update methods', () => {
    it('should update school properties', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary'
      });

      const updatedSchool = school.update({
        name: 'Updated School',
        enrollment: 600
      });

      expect(updatedSchool.name).toBe('Updated School');
      expect(updatedSchool.enrollment).toBe(600);
      expect(updatedSchool.districtId).toBe(1);
      expect(updatedSchool.schoolType).toBe('Elementary');
    });

    it("should activate school", () => {
      const school = new School({
        districtId: 1,
        name: "Test School",
        schoolType: "Elementary",
        statusId: 2,
      });

      school.markAsActive();
      expect(school.statusId).toBe(1);
    });

    it("should deactivate school", () => {
      const school = new School({
        districtId: 1,
        name: "Test School",
        schoolType: "Elementary",
        statusId: 1,
      });

      school.markAsInactive();
      expect(school.statusId).toBe(2);
    });

    it("should archive school by setting statusId to 2", () => {
      const school = new School({
        districtId: 1,
        name: "Test School",
        schoolType: "Elementary",
        statusId: 1,
      });

      school.markAsInactive();
      expect(school.statusId).toBe(2);
    });
  });

  describe('toJSON', () => {
    it('should convert school to JSON with all properties', () => {
      const school = new School({
        id: 1,
        districtId: 1,
        name: 'Test School',
        enrollment: 500,
        schoolType: 'Elementary',
        addressLine1: '123 Main St',
        overrideDistrictBilling: true,
        statusId: 2,

        isDeleted: false
      });

      const json = school.toJSON();
      expect(json.id).toBe(1);
      expect(json.districtId).toBe(1);
      expect(json.name).toBe('Test School');
      expect(json.enrollment).toBe(500);
      expect(json.overrideDistrictBilling).toBe(true);
      expect(json.statusId).toBe(2);

    });

    it('should convert null values to undefined in JSON', () => {
      const school = new School({
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary'
      });

      const json = school.toJSON();
      expect(json.enrollment).toBeUndefined();
      expect(json.addressLine1).toBeUndefined();
      expect(json.notes).toBeUndefined();
    });
  });

  describe('fromPrismaModel', () => {
    it('should create School from Prisma model', () => {
      const prismaModel = {
        id: 1,
        districtId: 1,
        name: 'Test School',
        enrollment: 500,
        schoolType: 'Elementary',
        addressLine1: '123 Main St',
        addressLine2: null,
        city: 'Test City',
        state: 'TX',
        zipCode: '12345',
        shippingAddressLine1: null,
        shippingAddressLine2: null,
        shippingAddressCity: null,
        shippingAddressState: null,
        shippingAddressZipCode: null,
        notes: null,
        overrideDistrictBilling: false,
        statusId: 1,

        isDeleted: false,
        createdAt: new Date('2023-01-01'),
        code: 'TST001',
        location: null,
        directorName: null,
        raNumber: null,
        superintendent: null,
        established: null,
        budget: null,
        participatingIn: null,
        website: null,
        description: null,
        logo: null,
        fax: null,
        updatedAt: new Date('2023-01-02')
      };

      const school = School.fromPrismaModel(prismaModel);
      expect(school.id).toBe(1);
      expect(school.name).toBe('Test School');
      expect(school.enrollment).toBe(500);
      expect(school.addressLine1).toBe('123 Main St');
      expect(school.addressLine2).toBeNull();
    });
  });

  describe('mapUpdateRequestToProps', () => {
    it('should map update request data to school properties', () => {
      const updateData = {
        name: 'Updated School',
        enrollment: 600,
        schoolType: 'Middle School',
        addressLine1: '456 Oak St',
        addressLine2: 'Suite 200',
        city: 'New City',
        state: 'CA',
        zipCode: '67890',
        shippingAddressLine1: '789 Pine St',
        shippingAddressLine2: 'Building B',
        shippingAddressCity: 'Shipping City',
        shippingAddressState: 'NY',
        shippingAddressZipCode: '54321',
        notes: 'Updated notes',
        overrideDistrictBilling: true
      };

      const props = School.mapUpdateRequestToProps(updateData);

      expect(props.name).toBe('Updated School');
      expect(props.enrollment).toBe(600);
      expect(props.schoolType).toBe('Middle School');
      expect(props.addressLine1).toBe('456 Oak St');
      expect(props.addressLine2).toBe('Suite 200');
      expect(props.city).toBe('New City');
      expect(props.state).toBe('CA');
      expect(props.zipCode).toBe('67890');
      expect(props.shippingAddressLine1).toBe('789 Pine St');
      expect(props.shippingAddressLine2).toBe('Building B');
      expect(props.shippingAddressCity).toBe('Shipping City');
      expect(props.shippingAddressState).toBe('NY');
      expect(props.shippingAddressZipCode).toBe('54321');
      expect(props.notes).toBe('Updated notes');
      expect(props.overrideDistrictBilling).toBe(true);
    });

    it('should handle undefined values in update request', () => {
      const updateData = {
        name: 'Updated School',
        enrollment: undefined,
        addressLine1: undefined
      };

      const props = School.mapUpdateRequestToProps(updateData);

      expect(props.name).toBe('Updated School');
      expect(props.enrollment).toBeUndefined();
      expect(props.addressLine1).toBeUndefined();
      expect(props.schoolType).toBeUndefined();
    });

    it('should handle empty string values by converting to undefined', () => {
      const updateData = {
        name: '',
        enrollment: 0,
        addressLine1: '',
        notes: ''
      };

      const props = School.mapUpdateRequestToProps(updateData);

      expect(props.name).toBeUndefined();
      expect(props.enrollment).toBeUndefined();
      expect(props.addressLine1).toBeUndefined();
      expect(props.notes).toBeUndefined();
    });

    it('should handle partial update data', () => {
      const updateData = {
        name: 'Partial Update',
        city: 'New City'
      };

      const props = School.mapUpdateRequestToProps(updateData);

      expect(props.name).toBe('Partial Update');
      expect(props.city).toBe('New City');
      expect(props.enrollment).toBeUndefined();
      expect(props.addressLine1).toBeUndefined();
    });

    it('should handle boolean values correctly', () => {
      const updateData = {
        overrideDistrictBilling: false
      };

      const props = School.mapUpdateRequestToProps(updateData);

      expect(props.overrideDistrictBilling).toBeUndefined();
    });

    it('should handle truthy boolean values correctly', () => {
      const updateData = {
        overrideDistrictBilling: true
      };

      const props = School.mapUpdateRequestToProps(updateData);

      expect(props.overrideDistrictBilling).toBe(true);
    });
  });
});
