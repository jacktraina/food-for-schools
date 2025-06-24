import { SchoolService } from '../../../../src/application/services/SchoolService';
import { ISchoolRepository } from '../../../../src/domain/interfaces/Schools/ISchoolRepository';
import { IUserRepository } from '../../../../src/domain/interfaces/users/IUserRepository';
import { IContactRepository } from '../../../../src/domain/interfaces/Contacts/IContactRepository';
import { IOrganizationContactRepository } from '../../../../src/domain/interfaces/OrganizationContacts/IOrganizationContactRepository';
import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { IDistrictRepository } from '../../../../src/domain/interfaces/Districts/IDistrictRepository';
import { NotFoundError } from '../../../../src/domain/core/errors/NotFoundError';
import { ForbiddenError } from '../../../../src/domain/core/errors/ForbiddenError';

describe('SchoolService - getSchoolDetails', () => {
  let schoolService: SchoolService;
  let mockSchoolRepository: jest.Mocked<ISchoolRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockContactRepository: jest.Mocked<IContactRepository>;
  let mockOrganizationContactRepository: jest.Mocked<IOrganizationContactRepository>;
  let mockDatabaseService: jest.Mocked<IDatabaseService>;
  let mockDistrictRepository: jest.Mocked<IDistrictRepository>;

  const mockSchool = {
    id: 1,
    districtId: 1,
    name: 'Test School',
    enrollment: 500,
    schoolType: 'Elementary',
    addressLine1: '123 School St',
    addressLine2: 'Suite 100',
    city: 'Test City',
    state: 'TX',
    zipCode: '12345',
    shippingAddressLine1: '456 Shipping St',
    shippingAddressLine2: 'Unit 200',
    shippingAddressCity: 'Shipping City',
    shippingAddressState: 'TX',
    shippingAddressZipCode: '67890',
    notes: 'Test notes',
    isDeleted: false,
  };

  const mockDistrict = {
    id: 1,
    name: 'Test District',
    cooperativeId: 1,
  };

  const mockPrimaryContact = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    title: 'Principal',
    phone: '555-1234',
    email: 'john.doe@school.edu',
    address1: '123 Contact St',
    address2: 'Apt 1',
    city: 'Contact City',
    state: 'TX',
    zipcode: '11111',
  };

  const mockBillingContact = {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    title: 'Business Manager',
    phone: '555-5678',
    email: 'jane.smith@school.edu',
    address1: '789 Billing St',
    address2: 'Suite 300',
    city: 'Billing City',
    state: 'TX',
    zipcode: '22222',
  };

  const mockPrimaryOrganizationContact = {
    id: 1,
    organizationId: 1,
    contactId: 1,
    rank: 1,
    contact: mockPrimaryContact,
  };

  const mockBillingOrganizationContact = {
    id: 2,
    organizationId: 1,
    contactId: 2,
    rank: 2,
    contact: mockBillingContact,
  };

  const mockOrganizationContacts = [
    mockPrimaryOrganizationContact,
    mockBillingOrganizationContact,
  ];

  beforeEach(() => {
    mockSchoolRepository = {
      create: jest.fn(),
      createWithTransaction: jest.fn(),
      findById: jest.fn(),
      findByDistrictId: jest.fn(),
      findByDistrictIdWithStatus: jest.fn(),
      update: jest.fn(),
      updateWithTransaction: jest.fn(),
      softDelete: jest.fn(),
    } as any;

    mockUserRepository = {
      getUserDetails: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      findDistrictById: jest.fn(),
      findAllUsers: jest.fn(),
      searchUsers: jest.fn(),
      create: jest.fn(),
      updatePassword: jest.fn(),
      markAsEmailVerified: jest.fn(),
      findManyByIds: jest.fn(),
      softDelete: jest.fn(),
    } as any;

    mockContactRepository = {
      create: jest.fn(),
      createWithTransaction: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      updateWithTransaction: jest.fn(),
      delete: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    mockOrganizationContactRepository = {
      create: jest.fn(),
      createWithTransaction: jest.fn(),
      findById: jest.fn(),
      findByOrganizationId: jest.fn(),
      findByContactId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockDatabaseService = {
      runInTransaction: jest.fn().mockImplementation((callback) => callback({})),
    } as any;

    mockDistrictRepository = {
      create: jest.fn(),
      createWithTransaction: jest.fn(),
      findByCooperativeId: jest.fn(),
      findByIds: jest.fn(),
      update: jest.fn(),
      updateWithTransaction: jest.fn(),
      findLastDistrictCode: jest.fn(),
      countByCooperativeId: jest.fn(),
      countByCooperativeIdSince: jest.fn(),
    } as any;

    schoolService = new SchoolService(
      mockSchoolRepository,
      mockUserRepository,
      mockContactRepository,
      mockOrganizationContactRepository,
      mockDatabaseService,
      mockDistrictRepository
    );
  });

  describe('successful retrieval', () => {
    it('should return school details with all contact information', async () => {
      mockSchoolRepository.findById.mockResolvedValue(mockSchool as any);
      mockDistrictRepository.findByIds.mockResolvedValue(mockDistrict as any);
      mockOrganizationContactRepository.findByOrganizationId.mockResolvedValue(mockOrganizationContacts as any);

      const result = await schoolService.getSchoolDetails(1, 1);

      expect(result).toEqual({
        id: 1,
        districtId: 1,
        districtName: 'Test District',
        name: 'Test School',
        enrollment: 500,
        schoolType: 'Elementary',
        addressLine1: '123 School St',
        addressLine2: 'Suite 100',
        city: 'Test City',
        state: 'TX',
        zipCode: '12345',
        shippingAddressLine1: '456 Shipping St',
        shippingAddressLine2: 'Unit 200',
        shippingAddressCity: 'Shipping City',
        shippingAddressState: 'TX',
        shippingAddressZipCode: '67890',
        notes: 'Test notes',
        contactFirstName: 'John',
        contactLastName: 'Doe',
        contactTitle: 'Principal',
        contactPhone: '555-1234',
        contactEmail: 'john.doe@school.edu',
        billingContact: 'Jane Smith',
        billingPhone: '555-5678',
        billingEmail: 'jane.smith@school.edu',
        billingAddressLine1: '789 Billing St',
        billingAddressLine2: 'Suite 300',
        billingCity: 'Billing City',
        billingState: 'TX',
        billingZipCode: '22222',
      });
    });

    it('should return school details with only primary contact', async () => {
      const primaryContactOnly = [mockPrimaryOrganizationContact];
      mockSchoolRepository.findById.mockResolvedValue(mockSchool as any);
      mockDistrictRepository.findByIds.mockResolvedValue(mockDistrict as any);
      mockOrganizationContactRepository.findByOrganizationId.mockResolvedValue(primaryContactOnly as any);

      const result = await schoolService.getSchoolDetails(1, 1);

      expect(result.contactFirstName).toBe('John');
      expect(result.contactLastName).toBe('Doe');
      expect(result.billingContact).toBeUndefined();
      expect(result.billingPhone).toBeUndefined();
      expect(result.billingEmail).toBeUndefined();
    });

    it('should return school details with no contacts', async () => {
      mockSchoolRepository.findById.mockResolvedValue(mockSchool as any);
      mockDistrictRepository.findByIds.mockResolvedValue(mockDistrict as any);
      mockOrganizationContactRepository.findByOrganizationId.mockResolvedValue([]);

      const result = await schoolService.getSchoolDetails(1, 1);

      expect(result.contactFirstName).toBeUndefined();
      expect(result.contactLastName).toBeUndefined();
      expect(result.billingContact).toBeUndefined();
    });
  });

  describe('error scenarios', () => {
    it('should throw NotFoundError when school is not found', async () => {
      mockSchoolRepository.findById.mockResolvedValue(null);

      await expect(schoolService.getSchoolDetails(1, 1)).rejects.toThrow(NotFoundError);
      await expect(schoolService.getSchoolDetails(1, 1)).rejects.toThrow('School not found');
    });

    it('should throw ForbiddenError when school does not belong to district', async () => {
      const schoolWithDifferentDistrict = { ...mockSchool, districtId: 2 };
      mockSchoolRepository.findById.mockResolvedValue(schoolWithDifferentDistrict as any);

      await expect(schoolService.getSchoolDetails(1, 1)).rejects.toThrow(ForbiddenError);
      await expect(schoolService.getSchoolDetails(1, 1)).rejects.toThrow('School does not belong to the specified district');
    });

    it('should throw NotFoundError when school is deleted', async () => {
      const deletedSchool = { ...mockSchool, isDeleted: true };
      mockSchoolRepository.findById.mockResolvedValue(deletedSchool as any);

      await expect(schoolService.getSchoolDetails(1, 1)).rejects.toThrow(NotFoundError);
      await expect(schoolService.getSchoolDetails(1, 1)).rejects.toThrow('School has been deleted');
    });

    it('should throw NotFoundError when district details are not found', async () => {
      mockSchoolRepository.findById.mockResolvedValue(mockSchool as any);
      mockDistrictRepository.findByIds.mockResolvedValue(null);

      await expect(schoolService.getSchoolDetails(1, 1)).rejects.toThrow(NotFoundError);
      await expect(schoolService.getSchoolDetails(1, 1)).rejects.toThrow('District details not found');
    });
  });

  describe('repository method calls', () => {
    it('should call repositories with correct parameters', async () => {
      mockSchoolRepository.findById.mockResolvedValue(mockSchool as any);
      mockDistrictRepository.findByIds.mockResolvedValue(mockDistrict as any);
      mockOrganizationContactRepository.findByOrganizationId.mockResolvedValue(mockOrganizationContacts as any);

      await schoolService.getSchoolDetails(1, 1);

      expect(mockSchoolRepository.findById).toHaveBeenCalledWith(1);
      expect(mockDistrictRepository.findByIds).toHaveBeenCalledWith(1);
      expect(mockOrganizationContactRepository.findByOrganizationId).toHaveBeenCalledWith(1);
    });
  });
});
