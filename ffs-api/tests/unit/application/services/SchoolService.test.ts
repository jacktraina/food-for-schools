import { SchoolService } from '../../../../src/application/services/SchoolService';
import { ISchoolRepository } from '../../../../src/domain/interfaces/Schools/ISchoolRepository';
import { IUserRepository } from '../../../../src/domain/interfaces/users/IUserRepository';
import { IContactRepository } from '../../../../src/domain/interfaces/Contacts/IContactRepository';
import { IOrganizationContactRepository } from '../../../../src/domain/interfaces/OrganizationContacts/IOrganizationContactRepository';
import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { IDistrictRepository } from '../../../../src/domain/interfaces/Districts/IDistrictRepository';
import { School } from '../../../../src/domain/interfaces/Schools/School';

describe('SchoolService', () => {
  let schoolService: SchoolService;
  let mockSchoolRepository: any;
  let mockUserRepository: any;
  let mockContactRepository: any;
  let mockOrganizationContactRepository: any;
  let mockDatabaseService: any;
  let mockDistrictRepository: any;

  beforeEach(() => {
    mockSchoolRepository = {
      create: jest.fn(),
      createWithTransaction: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByDistrictId: jest.fn(),
      findByDistrictIdWithStatus: jest.fn(),
      update: jest.fn(),
      updateWithTransaction: jest.fn(),
      delete: jest.fn(),
    };

    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getUserDetails: jest.fn(),
      findDistrictById: jest.fn(),
    };

    mockContactRepository = {
      create: jest.fn(),
      createWithTransaction: jest.fn().mockResolvedValue({ id: 1, firstName: 'John', lastName: 'Doe' }),
      updateWithTransaction: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockOrganizationContactRepository = {
      create: jest.fn(),
      createWithTransaction: jest.fn().mockResolvedValue({ id: 1, contactId: 1, organizationId: 1 }),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockDatabaseService = {
      runInTransaction: jest.fn().mockImplementation((callback) => callback({})),
    };

    mockDistrictRepository = {
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

    schoolService = new SchoolService(
      mockSchoolRepository,
      mockUserRepository,
      mockContactRepository,
      mockOrganizationContactRepository,
      mockDatabaseService,
      mockDistrictRepository
    );
  });

  describe('createSchool', () => {
    it('should create a new school successfully', () => {
      const schoolData = {
        id: 1,
        districtId: 1,
        name: 'Test Elementary School',
        schoolType: 'Elementary School',
        statusId: 1,
        overrideDistrictBilling: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      const school = new School(schoolData);

      mockSchoolRepository.create.mockResolvedValue(school);

      expect(school).toBeInstanceOf(School);
      expect(school.name).toBe(schoolData.name);
      expect(school.districtId).toBe(schoolData.districtId);
      expect(school.schoolType).toBe(schoolData.schoolType);
    });
  });

  describe('createSchool', () => {
    it('should create a school successfully', async () => {
      const districtId = 1;
      const schoolData = {
        name: 'Test Elementary School',
        schoolType: 'Elementary School' as const,
        overrideDistrictBilling: false,
      };
      const userId = 1;

      const mockUser = {
        cooperativeId: 1,
        districtId: 1,
        getAdminRoles: jest.fn().mockReturnValue([
          { role: { name: 'District Admin' } }
        ])
      };

      const mockDistrict = {
        cooperativeId: 1
      };

      const mockSchool = new School({
        id: 1,
        districtId,
        name: schoolData.name,
        schoolType: schoolData.schoolType,
        overrideDistrictBilling: schoolData.overrideDistrictBilling,
        statusId: 1,
        isDeleted: false,
      });

      mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
      mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict);
      mockSchoolRepository.createWithTransaction.mockResolvedValue(mockSchool);

      const result = await schoolService.createSchool(districtId, schoolData, userId);

      expect(result).toBeInstanceOf(School);
      expect(result.name).toBe(schoolData.name);
    });
  });

  describe('getSchoolsByDistrictId', () => {
    it('should return schools for a district', async () => {
      const districtId = 1;
      const userId = 1;
      const mockSchools = [
        new School({ id: 1, districtId, name: 'Elementary School', schoolType: 'Elementary School' }),
        new School({ id: 2, districtId, name: 'High School', schoolType: 'High School' }),
      ];

      const mockUser = {
        cooperativeId: 1,
        districtId: 1,
        getAdminRoles: jest.fn().mockReturnValue([
          { role: { name: 'District Admin' } }
        ])
      };

      const mockDistrict = {
        cooperativeId: 1
      };

      mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
      mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict);
      mockSchoolRepository.findByDistrictIdWithStatus.mockResolvedValue(mockSchools);

      const result = await schoolService.getSchoolsByDistrictId(districtId, userId);

      expect(mockUserRepository.getUserDetails).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.findDistrictById).toHaveBeenCalledWith(districtId);
      expect(mockSchoolRepository.findByDistrictIdWithStatus).toHaveBeenCalledWith(districtId);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(School);
      expect(result[1]).toBeInstanceOf(School);
    });
  });

  describe('activateSchool', () => {
    it('should activate a school', async () => {
      const school = new School({
        id: 1,
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary School',
        statusId: 2,
      });

      school.markAsActive();

      expect(school.statusId).toBe(1);
    });
  });

  describe('deactivateSchool', () => {
    it('should deactivate a school', async () => {
      const school = new School({
        id: 1,
        districtId: 1,
        name: 'Test School',
        schoolType: 'Elementary School',
        statusId: 1,
      });

      school.markAsInactive();

      expect(school.statusId).toBe(2);
    });
  });
});
