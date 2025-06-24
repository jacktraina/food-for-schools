import { DistrictService } from '../../../../src/application/services/DistrictService';
import { IDistrictRepository } from '../../../../src/domain/interfaces/Districts/IDistrictRepository';
import { IDistrictProductRepository } from '../../../../src/domain/interfaces/DistrictProducts/IDistrictProductRepository';
import { CreateDistrictRequest } from '../../../../src/interfaces/requests/district/CreateDistrictRequest';
import { BadRequestError } from '../../../../src/domain/core/errors/BadRequestError';
import { ISchoolRepository } from '../../../domain/interfaces/Schools/ISchoolRepository';
import { District } from '../../../../src/domain/interfaces/Districts/District';
import { IContactRepository } from '../../../../src/domain/interfaces/Contacts/IContactRepository';
import { IOrganizationContactRepository } from '../../../../src/domain/interfaces/OrganizationContacts/IOrganizationContactRepository';
import { Contact } from '../../../../src/domain/interfaces/Contacts/Contact';
import { OrganizationContact } from '../../../../src/domain/interfaces/OrganizationContacts/OrganizationContact';
import { DistrictProduct } from '../../../../src/domain/interfaces/DistrictProducts/DistrictProduct';
import { PrismaClient } from '@prisma/client';

describe('DistrictService', () => {
  const mockDistrictRepository: jest.Mocked<IDistrictRepository> = {
    create: jest.fn(),
    createWithTransaction: jest.fn(),
    findAll: jest.fn(),
    findByCooperativeId: jest.fn(),
    findByIds: jest.fn(),
    update: jest.fn(),
    updateWithTransaction: jest.fn(),
    findLastDistrictCode: jest.fn(),
    countByCooperativeId: jest.fn(),
    countByCooperativeIdSince: jest.fn(),
  };

  const mockDistrictProductRepository: jest.Mocked<IDistrictProductRepository> =
    {
      create: jest.fn(),
      createWithTransaction: jest.fn(),
      deleteByDistrictId: jest.fn(),
      deleteByDistrictIdWithTransaction: jest.fn(),
      findByDistrictId: jest.fn(),
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
    
    mockContactRepository.create.mockResolvedValue({ id: 1 } as Contact);
    mockContactRepository.createWithTransaction.mockResolvedValue({ id: 1 } as Contact);
    mockOrganizationContactRepository.create.mockResolvedValue({ id: 1 } as OrganizationContact);
    mockOrganizationContactRepository.createWithTransaction.mockResolvedValue({ id: 1 } as OrganizationContact);
    mockDistrictRepository.findByCooperativeId.mockResolvedValue([]);
    mockDistrictRepository.createWithTransaction.mockImplementation((prisma, district) => Promise.resolve(district));
    mockDistrictProductRepository.createWithTransaction.mockResolvedValue({ id: 1 } as DistrictProduct);
    mockDatabaseService.runInTransaction.mockImplementation(async (callback) => {
      const result = await callback({} as PrismaClient);
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
      } as CreateDistrictRequest;

      const mockCreatedDistrict = {
        id: mockDistrictId,
        ...request,
        statusId: 1,
        cooperativeId: 1,
        createdAt: new Date(),
        isDeleted: false,
        isActive: () => true,
        getDisplayName: () => 'Northview District',
      } as unknown as District;

      mockDistrictRepository.createWithTransaction.mockResolvedValue(mockCreatedDistrict);

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

      expect(result).toEqual(mockCreatedDistrict);
    });

    it('should create a district without products if none are provided', async () => {
      const request = {
        name: 'No Product District',
        email: 'no-products@edu.org',
      } as CreateDistrictRequest;

      const mockCreatedDistrict = {
        id: 102,
        ...request,
        statusId: 2,
        cooperativeId: 20,
        createdAt: new Date(),
        isDeleted: false,
        isActive: () => true,
        getDisplayName: () => 'Northview District',
      } as unknown as District;

      mockDistrictRepository.createWithTransaction.mockResolvedValue(mockCreatedDistrict);

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
});
