import { District } from "../../../../../src/domain/interfaces/Districts/District";

describe('District', () => {
  const baseDistrictProps = {
    id: 1,
    cooperativeId: 100,
    name: 'Greenwood School District',
    location: 'Central City',
    directorName: 'Dr. Alice Smith',
    streetAddress1: '123 Main St',
    streetAddress2: null,
    city: 'Greenwood',
    state: 'CA',
    zipCode: '90210',
    phone: '123-456-7890',
    email: 'info@greenwood.edu',
    fax: '123-456-7891',
    website: 'https://greenwood.edu',
    districtEnrollment: 5000,
    raNumber: 'RA-12345',
    numberOfSchools: 10,
    numberOfStudents: 4800,
    annualBudget: new (require('@prisma/client/runtime/library').Decimal)(10000000),
    secondaryContactName: 'Bob Jones',
    secondaryContactPhone: '321-654-0987',
    secondaryContactEmail: 'bob@greenwood.edu',
    superintendentName: 'Dr. Alice Smith',
    establishedYear: 1985,
    billingContactName: 'Billing Dept',
    billingContactStreetAddress1: '456 Market St',
    billingContactStreetAddress2: null,
    billingContactCity: 'Greenwood',
    billingContactState: 'CA',
    billingContactZipCode: '90211',
    billingContactPhone: '987-654-3210',
    billingContactEmail: 'billing@greenwood.edu',
    statusId: 1,
    createdAt: new Date(),
    isDeleted: false,
    districtProducts: [],
    organizations: undefined,
    userStatuses: undefined,
    schools: [],
  };

  describe('constructor', () => {
    it('should initialize all properties correctly', () => {
      const district = new District(baseDistrictProps);

      expect(district.id).toBe(1);
      expect(district.name).toBe('Greenwood School District');
      expect(district.city).toBe('Greenwood');
      expect(district.state).toBe('CA');
      expect(district.zipCode).toBe('90210');
      expect(district.phone).toBe('123-456-7890');
      expect(district.statusId).toBe(1);
      expect(district.isDeleted).toBe(false);
      expect(district.districtProducts).toHaveLength(0);
    });

    it('should default optional properties when not provided', () => {
      const minimalProps = {
        cooperativeId: 100,
        name: 'Minimal District',
        statusId: 1,
      };

      const district = new District(minimalProps);

      expect(district.name).toBe('Minimal District');
      expect(district.isDeleted).toBe(false);
      expect(district.districtProducts).toEqual([]);
      expect(district.schools).toEqual([]);
    });
  });

  describe('isActive', () => {
    it('should return true when statusId is 1', () => {
      const district = new District({ ...baseDistrictProps, statusId: 1 });
      expect(district.isActive()).toBe(true);
    });

    it('should return false when statusId is not 1', () => {
      const district = new District({ ...baseDistrictProps, statusId: 2 });
      expect(district.isActive()).toBe(false);
    });
  });

  describe('getDisplayName', () => {
    it('should return the district name', () => {
      const district = new District(baseDistrictProps);
      expect(district.getDisplayName()).toBe('Greenwood School District');
    });
  });
});
