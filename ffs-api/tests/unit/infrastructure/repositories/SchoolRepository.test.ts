import { SchoolRepository } from '../../../../src/infrastructure/repositories/SchoolRepository';
import { School } from '../../../../src/domain/interfaces/Schools/School';
import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';

describe('SchoolRepository', () => {
  let repository: SchoolRepository;
  let mockDatabaseService: any;
  let mockPrismaClient: any;

  beforeEach(() => {
    mockPrismaClient = {
      school: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockDatabaseService = {
      getClient: jest.fn().mockReturnValue(mockPrismaClient),
      connect: jest.fn(),
      disconnect: jest.fn(),
      runInTransaction: jest.fn(),
    };
    
    repository = new SchoolRepository(mockDatabaseService);
  });

  describe('create', () => {
    it('should create a new school', async () => {
      const mockSchoolData = {
        id: 1,
        districtId: 1,
        name: 'Test Elementary School',
        enrollment: null,
        schoolType: 'Elementary',
        addressLine1: null,
        addressLine2: null,
        city: 'Test City',
        state: 'TS',
        zipCode: null,
        shippingAddressLine1: null,
        shippingAddressLine2: null,
        shippingAddressCity: null,
        shippingAddressState: null,
        shippingAddressZipCode: null,
        phone: '555-0123',
        email: 'test@school.edu',
        notes: null,
        overrideDistrictBilling: false,
        statusId: 1,
        isDeleted: false,
        createdAt: new Date(),
      };

      const school = new School(mockSchoolData);

      mockPrismaClient.school.create.mockResolvedValue(mockSchoolData);

      const result = await repository.create(school);

      expect(mockPrismaClient.school.create).toHaveBeenCalledWith({
        data: {
          districtId: school.districtId,
          name: school.name,
          enrollment: school.enrollment,
          schoolType: school.schoolType,
          addressLine1: school.addressLine1,
          addressLine2: school.addressLine2,
          city: school.city,
          state: school.state,
          zipCode: school.zipCode,
          shippingAddressLine1: school.shippingAddressLine1,
          shippingAddressLine2: school.shippingAddressLine2,
          shippingAddressCity: school.shippingAddressCity,
          shippingAddressState: school.shippingAddressState,
          shippingAddressZipCode: school.shippingAddressZipCode,
          phone: school.phone,
          fax: school.fax,
          email: school.email,
          website: school.website,
          notes: school.notes,
          overrideDistrictBilling: school.overrideDistrictBilling,
          statusId: 1,
          isDeleted: false,
        },
      });
      expect(result).toBeInstanceOf(School);
    });
  });

  describe('findAll', () => {
    it('should return all schools', async () => {
      const mockSchools = [
        {
          id: 1,
          districtId: 1,
          name: 'Test Elementary School',
          enrollment: null,
          schoolType: 'Elementary',
          addressLine1: null,
          addressLine2: null,
          city: 'Test City',
          state: 'TS',
          zipCode: null,
          shippingAddressLine1: null,
          shippingAddressLine2: null,
          shippingAddressCity: null,
          shippingAddressState: null,
          shippingAddressZipCode: null,
          phone: '555-0123',
          email: 'test@school.edu',
          notes: null,
          overrideDistrictBilling: false,
          statusId: 1,
          isDeleted: false,
          createdAt: new Date(),
        },
      ];

      mockPrismaClient.school.findMany.mockResolvedValue(mockSchools);

      const result = await repository.findByDistrictId(1);

      expect(mockPrismaClient.school.findMany).toHaveBeenCalledWith({
        where: {
          districtId: 1,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(School);
    });
  });

  describe('findById', () => {
    it('should return a school when found', async () => {
      const mockSchool = {
        id: 1,
        districtId: 1,
        name: 'Test Elementary School',
        enrollment: null,
        schoolType: 'Elementary',
        addressLine1: null,
        addressLine2: null,
        city: 'Test City',
        state: 'TS',
        zipCode: null,
        shippingAddressLine1: null,
        shippingAddressLine2: null,
        shippingAddressCity: null,
        shippingAddressState: null,
        shippingAddressZipCode: null,
        phone: '555-0123',
        email: 'test@school.edu',
        notes: null,
        overrideDistrictBilling: false,
        statusId: 1,
        isDeleted: false,
        createdAt: new Date(),
      };

      mockPrismaClient.school.findUnique.mockResolvedValue(mockSchool);

      const result = await repository.findById(1);

      expect(mockPrismaClient.school.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
      expect(result).toBeInstanceOf(School);
    });

    it('should return null when school not found', async () => {
      mockPrismaClient.school.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });
});
