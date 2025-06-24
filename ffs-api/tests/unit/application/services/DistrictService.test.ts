import { DistrictService } from '../../../../src/application/services/DistrictService';
import { IDistrictRepository } from '../../../../src/domain/interfaces/Districts/IDistrictRepository';
import { IDistrictProductRepository } from '../../../../src/domain/interfaces/DistrictProducts/IDistrictProductRepository';
import { CreateDistrictRequest } from '../../../../src/interfaces/requests/district/CreateDistrictRequest';
import { BadRequestError } from '../../../../src/domain/core/errors/BadRequestError';
import { NotFoundError } from '../../../../src/domain/core/errors/NotFoundError';
import { UpdateDistrictRequestData } from '../../../../src/interfaces/requests/district/UpdateDistrictRequest';
import { ISchoolRepository } from '../../../../src/domain/interfaces/Schools/ISchoolRepository';
import { School } from '../../../../src/domain/interfaces/Schools/School';
import { District } from '../../../../src/domain/interfaces/Districts/District';
import { IContactRepository } from '../../../../src/domain/interfaces/Contacts/IContactRepository';
import { IOrganizationContactRepository } from '../../../../src/domain/interfaces/OrganizationContacts/IOrganizationContactRepository';

describe('DistrictService', () => {
  const mockDistrictRepository: jest.Mocked<IDistrictRepository> = {
    create: jest.fn(),
    createWithTransaction: jest.fn(),
    findAll: jest.fn(),
    findByCooperativeId: jest.fn(),
    update: jest.fn(),
    updateWithTransaction: jest.fn(),
    findByIds: jest.fn(),
    findLastDistrictCode: jest.fn(),
    countByCooperativeId: jest.fn(),
    countByCooperativeIdSince: jest.fn(),
    // add more mocked methods if needed later
  };

  const mockDistrictProductRepository: jest.Mocked<IDistrictProductRepository> =
    {
      create: jest.fn(),
      createWithTransaction: jest.fn(),
      deleteByDistrictId: jest.fn(),
      deleteByDistrictIdWithTransaction: jest.fn(),
      findByDistrictId: jest.fn(),
      // add more mocked methods if needed later
    };

  const mockSchoolRepository: jest.Mocked<ISchoolRepository> = {
    create: jest.fn(),
    createWithTransaction: jest.fn(),
    findById: jest.fn(),
    findByDistrictId: jest.fn(),
    findByDistrictIdWithStatus: jest.fn(),
    update: jest.fn(),
    updateWithTransaction: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockContactRepository: jest.Mocked<IContactRepository> = {
    create: jest.fn(),
    createWithTransaction: jest.fn(),
    updateWithTransaction: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockOrganizationContactRepository: jest.Mocked<IOrganizationContactRepository> = {
    create: jest.fn(),
    createWithTransaction: jest.fn(),
    findById: jest.fn(),
    findByOrganizationId: jest.fn(),
    findByContactId: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockDatabaseService = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    getClient: jest.fn(),
    runInTransaction: jest.fn(),
  };

  let service: DistrictService;

  beforeEach(() => {
    service = new DistrictService(
      mockDistrictRepository,
      mockDistrictProductRepository,
      mockSchoolRepository,
      mockContactRepository,
      mockOrganizationContactRepository,
      mockDatabaseService
    );
    jest.clearAllMocks();
    
    mockContactRepository.create.mockResolvedValue({ id: 1 } as any);
    mockContactRepository.createWithTransaction.mockResolvedValue({ id: 1 } as any);
    mockOrganizationContactRepository.create.mockResolvedValue({ id: 1 } as any);
    mockOrganizationContactRepository.createWithTransaction.mockResolvedValue({ id: 1 } as any);
    mockDistrictRepository.findByCooperativeId.mockResolvedValue([]);
    mockDistrictRepository.createWithTransaction.mockImplementation((prisma, district) => {
      const districtWithId = Object.assign(district, { id: 101 });
      return Promise.resolve(districtWithId);
    });
    mockDistrictProductRepository.createWithTransaction.mockResolvedValue({ id: 1 } as any);
    mockDatabaseService.runInTransaction.mockImplementation(async (callback) => {
      const result = await callback({} as any);
      return result;
    });
  });

  describe('createDistrict', () => {
    it('should create a district and its associated products', async () => {
      const mockDistrictId = 101;

      const request: CreateDistrictRequest = {
        name: 'Northview District',
        location: 'North Town',
        email: 'info@northview.edu',
        website: 'https://northview.edu',
        directorName: 'Jane Doe',
        addressLine1: '123 Main St',
        addressLine2: 'Suite 100',
        city: 'Northview',
        state: 'NV',
        zipCode: '12345',
        phone: '555-1234',
        fax: '555-5678',
        enrollment: 5000,
        raNumber: 'RA123456',
        schools: 10,
        students: 4500,
        budget: '2000000',
        contact2: 'John Smith',
        contact2Phone: '555-8765',
        contact2Email: 'john.smith@northview.edu',
        superintendent: 'Dr. Emily Brown',
        established: '1990',
        billingContact: 'Alice Johnson',
        billingAddressLine1: '456 Elm St',
        billingAddressLine2: 'Apt 12B',
        billingCity: 'Northview',
        billingState: 'NV',
        billingZipCode: '12345',
        billingPhone: '555-4321',
        billingEmail: 'billing@northview.edu',
        products: ['Math Curriculum', 'Science Program'],
      };

      const mockCreatedDistrict = District.create(request, 1, 1, "district-1");
      mockCreatedDistrict.id = mockDistrictId;
      mockCreatedDistrict.createdAt = new Date('2025-06-18T10:56:45.162Z');

      mockDistrictRepository.create.mockResolvedValue(mockCreatedDistrict);

      const result = await service.createDistrict(request, 1, 1);

      expect(mockDatabaseService.runInTransaction).toHaveBeenCalledWith(expect.any(Function));
      expect(mockDistrictRepository.createWithTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          name: 'Northview District',
          location: 'North Town',
          email: 'info@northview.edu',
          website: 'https://northview.edu',
          statusId: 1,
          cooperativeId: 1,
        })
      );

      expect(mockDistrictProductRepository.createWithTransaction).toHaveBeenCalledTimes(2);
      expect(mockDistrictProductRepository.createWithTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        {
          districtId: mockDistrictId,
          productName: 'Math Curriculum',
        }
      );
      expect(mockDistrictProductRepository.createWithTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        {
          districtId: mockDistrictId,
          productName: 'Science Program',
        }
      );

      expect(result).toEqual(expect.objectContaining({
        id: mockCreatedDistrict.id,
        name: mockCreatedDistrict.name,
        location: mockCreatedDistrict.location,
        directorName: mockCreatedDistrict.directorName,
        streetAddress1: mockCreatedDistrict.streetAddress1,
        streetAddress2: mockCreatedDistrict.streetAddress2,
        city: mockCreatedDistrict.city,
        state: mockCreatedDistrict.state,
        zipCode: mockCreatedDistrict.zipCode,
        phone: mockCreatedDistrict.phone,
        email: mockCreatedDistrict.email,
        fax: mockCreatedDistrict.fax,
        website: mockCreatedDistrict.website,
        districtEnrollment: mockCreatedDistrict.districtEnrollment,
        raNumber: mockCreatedDistrict.raNumber,
        numberOfSchools: mockCreatedDistrict.numberOfSchools,
        numberOfStudents: mockCreatedDistrict.numberOfStudents,
        annualBudget: mockCreatedDistrict.annualBudget,
        superintendentName: mockCreatedDistrict.superintendentName,
        establishedYear: mockCreatedDistrict.establishedYear,
        statusId: mockCreatedDistrict.statusId,
        cooperativeId: mockCreatedDistrict.cooperativeId,
        code: mockCreatedDistrict.code,
        participatingIn: mockCreatedDistrict.participatingIn,
        shippingAddress: mockCreatedDistrict.shippingAddress,
        description: mockCreatedDistrict.description,
        notes: mockCreatedDistrict.notes,
        isDeleted: mockCreatedDistrict.isDeleted,
      }));
    });

    it('should create a district without products if none are provided', async () => {
      const request: CreateDistrictRequest = {
        name: 'No Product District',
        email: 'no-products@edu.org',
      };

      const mockCreatedDistrict = District.create(request, 2, 20, "district-1");
      mockCreatedDistrict.id = 101;

      mockDistrictRepository.create.mockResolvedValue(mockCreatedDistrict);

      const result = await service.createDistrict(request, 2, 20);

      expect(mockDatabaseService.runInTransaction).toHaveBeenCalledWith(expect.any(Function));
      expect(mockDistrictRepository.createWithTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object)
      );
      expect(mockDistrictProductRepository.createWithTransaction).not.toHaveBeenCalled();
      expect(result).toEqual(mockCreatedDistrict);
    });

    it('should throw BadRequestError if districtRepository.create fails', async () => {
      const request: CreateDistrictRequest = { name: 'Fail District' };

      mockDatabaseService.runInTransaction.mockRejectedValue(
        new Error('Database error')
      );

      await expect(service.createDistrict(request, 3, 30)).rejects.toThrow(
        BadRequestError
      );
      expect(mockDatabaseService.runInTransaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('getDistrictLists', () => {
    it('should return a list of districts with mapped properties for the specified cooperative', async () => {
      const cooperativeId = 1;
      const districts = [
        {
          id: 1,
          name: 'Central District',
          city: 'Downtown',
          state: 'TX',
          location: 'Downtown, TX',
          numberOfSchools: 5,
          numberOfStudents: 2000,
          cooperativeId: cooperativeId,
          userStatus: { name: 'Active' },
        },
        {
          id: 2,
          name: 'East District',
          city: null,
          state: null,
          location: 'East Side',
          numberOfSchools: null,
          numberOfStudents: 1500,
          cooperativeId: cooperativeId,
          userStatus: null,
        },
      ];

      const mockSchoolsDistrict1 = [
        { id: 1, enrollment: 800 },
        { id: 2, enrollment: 1200 },
      ];

      const mockSchoolsDistrict2 = [
        { id: 3, enrollment: 600 },
        { id: 4, enrollment: 900 },
      ];

      mockDistrictRepository.findByCooperativeId.mockResolvedValue(districts as any);
      mockSchoolRepository.findByDistrictIdWithStatus
        .mockResolvedValueOnce(mockSchoolsDistrict1 as any)
        .mockResolvedValueOnce(mockSchoolsDistrict2 as any);

      const result = await service.getDistrictLists(cooperativeId);

      expect(mockDistrictRepository.findByCooperativeId).toHaveBeenCalledWith(cooperativeId);
      expect(mockSchoolRepository.findByDistrictIdWithStatus).toHaveBeenCalledWith(1);
      expect(mockSchoolRepository.findByDistrictIdWithStatus).toHaveBeenCalledWith(2);
      expect(result).toEqual([
        {
          id: 1,
          name: 'Central District',
          location: 'Downtown, TX',
          schools: 2,
          students: 2000,
          status: 'Active',
        },
        {
          id: 2,
          name: 'East District',
          location: 'East Side',
          schools: 2,
          students: 1500,
          status: null,
        },
      ]);
    });

    it('should return an empty array if no districts are found for the cooperative', async () => {
      const cooperativeId = 1;
      mockDistrictRepository.findByCooperativeId.mockResolvedValue([]);

      const result = await service.getDistrictLists(cooperativeId);

      expect(result).toEqual([]);
      expect(mockDistrictRepository.findByCooperativeId).toHaveBeenCalledWith(cooperativeId);
    });

    it('should throw BadRequestError if repository throws an error', async () => {
      const cooperativeId = 1;
      mockDistrictRepository.findByCooperativeId.mockRejectedValue(new Error('DB Error'));

      await expect(service.getDistrictLists(cooperativeId)).rejects.toThrow(BadRequestError);
      expect(mockDistrictRepository.findByCooperativeId).toHaveBeenCalledWith(cooperativeId);
    });
  });

  describe('updateDistrict', () => {
    const mockDistrictId = 101;
    const mockOrganizationId = 1;
    const existingDistrict = new District({
      id: mockDistrictId,
      name: 'Old Name',
      location: 'Old Location',
      directorName: 'Old Director',
      streetAddress1: 'Old St',
      streetAddress2: null,
      city: 'Old City',
      state: 'OL',
      zipCode: '00000',
      phone: '000-0000',
      email: 'old@email.com',
      fax: null,
      website: 'https://old.com',
      districtEnrollment: 1000,
      raNumber: 'OLDRA123',
      numberOfSchools: 5,
      numberOfStudents: 800,
      annualBudget: new (require('@prisma/client/runtime/library').Decimal)(500000),

      superintendentName: 'Old Sup',
      establishedYear: 1980,

      isDeleted: false,
      statusId: 1,
      cooperativeId: mockOrganizationId,
      createdAt: new Date(),
      code: 'OLD-001',
      participatingIn: 'Old Program',
      shippingAddress: 'Old Shipping',
      description: 'Old Description',
      notes: 'Old Notes',
    });

    beforeEach(() => {
      mockDistrictRepository.findByIds.mockReset();
      mockDistrictRepository.update.mockReset();
      mockDistrictProductRepository.deleteByDistrictId.mockReset();
      mockDistrictProductRepository.create.mockReset();
    });

    it('should update district and its products successfully', async () => {
      const updateData: UpdateDistrictRequestData = {
        name: 'New Name',
        location: 'New Location',
        products: ['New Product A', 'New Product B'],
      };

      mockDistrictRepository.findByIds.mockResolvedValue(existingDistrict);

      const result = await service.updateDistrict(
        mockDistrictId,
        updateData
      );

      expect(mockDistrictRepository.findByIds).toHaveBeenCalledWith(
        mockDistrictId
      );
      expect(mockDatabaseService.runInTransaction).toHaveBeenCalledWith(expect.any(Function));
      expect(mockDistrictRepository.updateWithTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          id: mockDistrictId,
          name: 'New Name',
          location: 'New Location',
        })
      );

      expect(
        mockDistrictProductRepository.deleteByDistrictIdWithTransaction
      ).toHaveBeenCalledWith(expect.any(Object), mockDistrictId);
      expect(mockDistrictProductRepository.createWithTransaction).toHaveBeenCalledTimes(2);
      expect(mockDistrictProductRepository.createWithTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        {
          districtId: mockDistrictId,
          productName: 'New Product A',
        }
      );
      expect(mockDistrictProductRepository.createWithTransaction).toHaveBeenCalledWith(
        expect.any(Object),
        {
          districtId: mockDistrictId,
          productName: 'New Product B',
        }
      );

      expect(result).toEqual({ message: 'District updated successfully' });
    });

    it('should update district without modifying products if not provided', async () => {
      const updateData: UpdateDistrictRequestData = {
        name: 'Only Name Updated',
      };

      mockDistrictRepository.findByIds.mockResolvedValue(existingDistrict);

      const result = await service.updateDistrict(
        mockDistrictId,
        updateData
      );

      expect(mockDatabaseService.runInTransaction).toHaveBeenCalledWith(expect.any(Function));
      expect(
        mockDistrictProductRepository.deleteByDistrictIdWithTransaction
      ).not.toHaveBeenCalled();
      expect(mockDistrictProductRepository.createWithTransaction).not.toHaveBeenCalled();

      expect(result).toEqual({ message: 'District updated successfully' });
    });

    it('should throw NotFoundError if district not found', async () => {
      mockDistrictRepository.findByIds.mockResolvedValue(null);

      await expect(
        service.updateDistrict(mockDistrictId, {})
      ).rejects.toThrow(NotFoundError);

      expect(mockDatabaseService.runInTransaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if update fails unexpectedly', async () => {
      mockDistrictRepository.findByIds.mockResolvedValue(existingDistrict);
      mockDatabaseService.runInTransaction.mockRejectedValue(
        new Error('Something went wrong')
      );

      await expect(
        service.updateDistrict(mockDistrictId, {})
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('getDistrictDetails', () => {
    const mockDistrictId = 1;
    const mockOrgId = 10;

    const mockDistrict = new District({
      id: mockDistrictId,
      statusId: 1,
      cooperativeId: mockOrgId,
      name: 'Test District',
      location: 'Testville',
      directorName: 'Jane Doe',
      streetAddress1: '123 Main St',
      streetAddress2: 'Apt 4B',
      city: 'Test City',
      state: 'TS',
      zipCode: '99999',
      phone: '123-456-7890',
      email: 'test@district.edu',
      fax: '123-456-7891',
      website: 'https://testdistrict.edu',
      districtEnrollment: 1000,
      raNumber: 'RA-001',
      numberOfSchools: 5,
      numberOfStudents: 900,
      annualBudget: new (require('@prisma/client/runtime/library').Decimal)(1000000),
      superintendentName: 'Dr. Brown',
      establishedYear: 2000,

      createdAt: new Date(),
      isDeleted: false,
      code: 'TEST-001',
      participatingIn: 'Test Program',
      shippingAddress: 'Test Shipping',
      description: 'Test Description',
      notes: 'Test Notes',
    });

    const mockProducts = [
      {
        id: 1,
        districtId: mockDistrictId,
        productName: 'Math Program',
        createdAt: new Date(),
        isDeleted: false,
        isActive: () => true,
        getDisplayName: () => 'Math Program',
      },
      {
        id: 2,
        districtId: mockDistrictId,
        productName: 'Science Kit',
        createdAt: new Date(),
        isDeleted: false,
        isActive: () => true,
        getDisplayName: () => 'Science Kit',
      },
    ];

    const mockSchools = [
      new School({
        id: 1,
        districtId: mockDistrictId,
        name: 'Test Elementary',
        enrollment: 300,
        schoolType: 'Elementary',
        createdAt: new Date(),
        isDeleted: false,

        overrideDistrictBilling: false,
        statusId: 1,
      }),
      new School({
        id: 2,
        districtId: mockDistrictId,
        name: 'Test High School',
        enrollment: 600,
        schoolType: 'High School',
        createdAt: new Date(),
        isDeleted: false,

        overrideDistrictBilling: false,
        statusId: 1,
      }),
    ];

    it('should return district details with products and schools', async () => {
      mockDistrictRepository.findByIds.mockResolvedValue(mockDistrict);
      mockDistrictProductRepository.findByDistrictId.mockResolvedValue(
        mockProducts
      );
      mockSchoolRepository.findByDistrictIdWithStatus.mockResolvedValue(mockSchools);
      mockOrganizationContactRepository.findByOrganizationId
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getDistrictDetails(
        mockDistrictId
      );

      expect(result).toEqual(
        expect.objectContaining({
          id: mockDistrict.id,
          cooperative_id: mockOrgId,
          name: 'Test District',
          shipping_address: 'Test Shipping',
          contact_first_name: null,
          contact_last_name: null,
          status: null,
          products: ['Math Program', 'Science Kit'],
          schools: [
            {
              id: 1,
              name: 'Test Elementary',
              enrollment: 300,
              school_type: 'Elementary',
              shipping_address: null,
              contact_first_name: null,
              contact_last_name: null,
              status: null,
            },
            {
              id: 2,
              name: 'Test High School',
              enrollment: 600,
              school_type: 'High School',
              shipping_address: null,
              contact_first_name: null,
              contact_last_name: null,
              status: null,
            },
          ],
        })
      );
      expect(mockDistrictRepository.findByIds).toHaveBeenCalledWith(
        mockDistrictId
      );
      expect(
        mockDistrictProductRepository.findByDistrictId
      ).toHaveBeenCalledWith(mockDistrictId);
      expect(mockSchoolRepository.findByDistrictIdWithStatus).toHaveBeenCalledWith(
        mockDistrictId
      );
      expect(mockOrganizationContactRepository.findByOrganizationId).toHaveBeenCalledWith(
        mockDistrictId
      );
      expect(mockOrganizationContactRepository.findByOrganizationId).toHaveBeenCalledWith(1);
      expect(mockOrganizationContactRepository.findByOrganizationId).toHaveBeenCalledWith(2);
    });

    it('should throw NotFoundError if district is not found', async () => {
      mockDistrictRepository.findByIds.mockResolvedValue(null);

      await expect(service.getDistrictDetails(999)).rejects.toThrow(
        NotFoundError
      );
      expect(mockDistrictRepository.findByIds).toHaveBeenCalledWith(
        999
      );
    });

    it('should throw BadRequestError on unexpected error', async () => {
      mockDistrictRepository.findByIds.mockRejectedValue(
        new Error('Unexpected DB error')
      );

      await expect(
        service.getDistrictDetails(mockDistrictId)
      ).rejects.toThrow(BadRequestError);
      expect(mockDistrictRepository.findByIds).toHaveBeenCalledWith(
        mockDistrictId
      );
    });
  });

  describe('deactivateDistrict', () => {
    const mockDistrictId = 101;
    const mockOrganizationId = 1;
  
    const existingDistrict = new District({
      id: mockDistrictId,
      name: 'Old Name',
      location: 'Old Location',
      directorName: 'Old Director',
      streetAddress1: 'Old St',
      streetAddress2: null,
      city: 'Old City',
      state: 'OL',
      zipCode: '00000',
      phone: '000-0000',
      email: 'old@email.com',
      fax: null,
      website: 'https://old.com',
      districtEnrollment: 1000,
      raNumber: 'OLDRA123',
      numberOfSchools: 5,
      numberOfStudents: 800,
      annualBudget: new (require('@prisma/client/runtime/library').Decimal)(500000),

      superintendentName: 'Old Sup',
      establishedYear: 1980,

      isDeleted: false,
      statusId: 1,
      cooperativeId: mockOrganizationId,
      createdAt: new Date(),
      code: 'OLD-001',
      participatingIn: 'Old Program',
      shippingAddress: 'Old Shipping',
      description: 'Old Description',
      notes: 'Old Notes',
    });
  
    beforeEach(() => {
      mockDistrictRepository.findByIds.mockReset();
      mockDistrictRepository.update.mockReset();
    });
  
    it('should deactivate district successfully', async () => {
      mockDistrictRepository.findByIds.mockResolvedValue(existingDistrict);
      mockDistrictRepository.update.mockResolvedValue(undefined);
  
      const result = await service.deactivateDistrict(
        mockDistrictId
      );
  
      expect(mockDistrictRepository.findByIds).toHaveBeenCalledWith(
        mockDistrictId
      );
      expect(mockDistrictRepository.update).toHaveBeenCalledWith(
        existingDistrict
      );
      expect(result).toEqual({ message: 'District deactivated successfully' });
    });
  
    it('should throw NotFoundError if district does not exist', async () => {
      mockDistrictRepository.findByIds.mockResolvedValue(null);
  
      await expect(
        service.deactivateDistrict(mockDistrictId)
      ).rejects.toThrow(NotFoundError);
  
      expect(mockDistrictRepository.update).not.toHaveBeenCalled();
    });
  
    it('should throw BadRequestError if updateStatus throws an unexpected error', async () => {
      mockDistrictRepository.findByIds.mockResolvedValue(existingDistrict);
      mockDistrictRepository.update.mockRejectedValue(
        new Error('DB failure')
      );
  
      await expect(
        service.deactivateDistrict(mockDistrictId)
      ).rejects.toThrow(BadRequestError);
    });
  });
  
  describe('deleteDistrict', () => {
    const mockDistrictId = 1;
    const mockOrgId = 10;
  
    const existingDistrict = new District({
      id: mockDistrictId,
      name: 'Old Name',
      location: 'Old Location',
      directorName: 'Old Director',
      streetAddress1: 'Old St',
      streetAddress2: null,
      city: 'Old City',
      state: 'OL',
      zipCode: '00000',
      phone: '000-0000',
      email: 'old@email.com',
      fax: null,
      website: 'https://old.com',
      districtEnrollment: 1000,
      raNumber: 'OLDRA123',
      numberOfSchools: 5,
      numberOfStudents: 800,
      annualBudget: new (require('@prisma/client/runtime/library').Decimal)(500000),
      superintendentName: 'Old Sup',
      establishedYear: 1980,

      isDeleted: false,
      statusId: 1,
      cooperativeId: mockOrgId,
      createdAt: new Date(),
      code: 'OLD-001',
      participatingIn: 'Old Program',
      shippingAddress: 'Old Shipping',
      description: 'Old Description',
      notes: 'Old Notes',
    });
  
    beforeEach(() => {
      mockDistrictRepository.findByIds.mockReset();
      mockDistrictRepository.update.mockReset();
    });
  
    it('should delete the district successfully', async () => {
      mockDistrictRepository.findByIds.mockResolvedValue(existingDistrict);
      mockDistrictRepository.update.mockResolvedValue(undefined);
  
      const result = await service.deleteDistrict(mockDistrictId);
  
      expect(mockDistrictRepository.findByIds).toHaveBeenCalledWith(
        mockDistrictId
      );
      expect(mockDistrictRepository.update).toHaveBeenCalledWith(existingDistrict);
      expect(result).toEqual({ message: 'District deleted successfully' });
    });
  
    it('should throw NotFoundError if district is not found', async () => {
      mockDistrictRepository.findByIds.mockResolvedValue(null);
  
      await expect(
        service.deleteDistrict(mockDistrictId)
      ).rejects.toThrow(NotFoundError);
  
      expect(mockDistrictRepository.update).not.toHaveBeenCalled();
    });
  
    it('should throw BadRequestError on unexpected error', async () => {
      mockDistrictRepository.findByIds.mockResolvedValue(existingDistrict);
      mockDistrictRepository.update.mockRejectedValue(new Error('DB failure'));
  
      await expect(
        service.deleteDistrict(mockDistrictId)
      ).rejects.toThrow(BadRequestError);
  
      expect(mockDistrictRepository.findByIds).toHaveBeenCalledWith(
        mockDistrictId
      );
      expect(mockDistrictRepository.update).toHaveBeenCalledWith(existingDistrict);
    });
  });
  
});
