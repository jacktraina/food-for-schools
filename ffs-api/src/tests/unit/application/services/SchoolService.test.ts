import { SchoolService } from '../../../../application/services/SchoolService';
import { ISchoolRepository } from '../../../../domain/interfaces/Schools/ISchoolRepository';
import { IUserRepository } from '../../../../domain/interfaces/users/IUserRepository';
import { IContactRepository } from '../../../../domain/interfaces/Contacts/IContactRepository';
import { IOrganizationContactRepository } from '../../../../domain/interfaces/OrganizationContacts/IOrganizationContactRepository';
import { IDatabaseService } from '../../../../application/contracts/IDatabaseService';
import { IDistrictRepository } from '../../../../domain/interfaces/Districts/IDistrictRepository';
import { School } from '../../../../domain/interfaces/Schools/School';
import { User } from '../../../../domain/interfaces/users/User';
import { UserRole } from '../../../../domain/interfaces/userRoles/UserRole';
import { Role } from '../../../../domain/interfaces/roles/Role';
import { RoleCategoryEnum } from '../../../../domain/constants/RoleCategoryEnum';
import { NotFoundError } from '../../../../domain/core/errors/NotFoundError';
import { ForbiddenError } from '../../../../domain/core/errors/ForbiddenError';
import { BadRequestError } from '../../../../domain/core/errors/BadRequestError';

describe('SchoolService', () => {
  let schoolService: SchoolService;
  let mockSchoolRepository: jest.Mocked<ISchoolRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockContactRepository: jest.Mocked<IContactRepository>;
  let mockOrganizationContactRepository: jest.Mocked<IOrganizationContactRepository>;
  let mockDatabaseService: jest.Mocked<IDatabaseService>;
  let mockDistrictRepository: jest.Mocked<IDistrictRepository>;
  
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    cooperativeId: 1,
    userRoles: [
      new UserRole({
        id: 1,
        userId: 1,
        roleId: 1,
        scopeId: 1,
        role: new Role({
          id: 1,
          name: 'Group Admin',
          categoryId: 1,
          roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
        })
      })
    ],
    getAdminRoles: jest.fn().mockReturnValue([
      new UserRole({
        id: 1,
        userId: 1,
        roleId: 1,
        scopeId: 1,
        role: new Role({
          id: 1,
          name: 'Group Admin',
          categoryId: 1,
          roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
        })
      })
    ]),
    getBidRoles: jest.fn().mockReturnValue([])
  } as unknown as User;

  const mockDistrict = {
    id: 1,
    cooperativeId: 1
  };

  const mockSchoolData = {
    name: 'Test School',
    schoolType: 'High School' as const,
    overrideDistrictBilling: true
  };

  const mockSchool = new School({
    id: 1,
    districtId: 1,
    name: 'Test School',
    schoolType: 'High School',
    overrideDistrictBilling: true,
    statusId: 1,
    isDeleted: false
  });

  beforeEach(() => {
    mockSchoolRepository = {
      create: jest.fn().mockResolvedValue(mockSchool),
      createWithTransaction: jest.fn().mockResolvedValue(mockSchool),
      findById: jest.fn(),
      findByDistrictId: jest.fn(),
      findByDistrictIdWithStatus: jest.fn(),
      update: jest.fn(),
      updateWithTransaction: jest.fn(),
      softDelete: jest.fn()
    };

    mockUserRepository = {
      getUserDetails: jest.fn().mockResolvedValue(mockUser),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      findDistrictById: jest.fn().mockResolvedValue(mockDistrict),
      findAllUsers: jest.fn(),
      searchUsers: jest.fn(),
      create: jest.fn(),
      updatePassword: jest.fn(),
      markAsEmailVerified: jest.fn(),
      findManyByIds: jest.fn(),
      softDelete: jest.fn()
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
    } as jest.Mocked<IContactRepository>;

    mockOrganizationContactRepository = {
      create: jest.fn(),
      createWithTransaction: jest.fn().mockResolvedValue({ id: 1, contactId: 1, organizationId: 1 }),
      findById: jest.fn(),
      findByOrganizationId: jest.fn(),
      findByContactId: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockDatabaseService = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      getClient: jest.fn(),
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
      mockSchoolRepository as unknown as ISchoolRepository,
      mockUserRepository as unknown as IUserRepository,
      mockContactRepository,
      mockOrganizationContactRepository,
      mockDatabaseService,
      mockDistrictRepository
    );
  });

  describe('createSchool', () => {
    it('should create a school successfully with valid data and permissions', async () => {
      const result = await schoolService.createSchool(1, mockSchoolData, 1);
      
      expect(mockUserRepository.getUserDetails).toHaveBeenCalledWith(1);
      expect(mockUserRepository.findDistrictById).toHaveBeenCalledWith(1);
      expect(mockSchoolRepository.createWithTransaction).toHaveBeenCalled();
      expect(result).toEqual(mockSchool);
    });

    it('should throw NotFoundError if user is not found', async () => {
      mockUserRepository.getUserDetails.mockResolvedValueOnce(null);
      
      await expect(schoolService.createSchool(1, mockSchoolData, 1))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if user does not have required role', async () => {
      const userWithoutAdminRole = {
        ...mockUser,
        getAdminRoles: jest.fn().mockReturnValue([])
      } as unknown as User;
      
      mockUserRepository.getUserDetails.mockResolvedValueOnce(userWithoutAdminRole);
      
      await expect(schoolService.createSchool(1, mockSchoolData, 1))
        .rejects.toThrow(ForbiddenError);
    });

    it('should throw NotFoundError if district is not found', async () => {
      mockUserRepository.findDistrictById.mockResolvedValueOnce(null);
      
      await expect(schoolService.createSchool(1, mockSchoolData, 1))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if district does not belong to user organization', async () => {
      mockUserRepository.findDistrictById.mockResolvedValueOnce({
        id: 1,
        cooperativeId: 2 // Different from user's cooperativeId
      });
      
      await expect(schoolService.createSchool(1, mockSchoolData, 1))
        .rejects.toThrow(ForbiddenError);
    });

    it('should throw BadRequestError if school type is invalid', async () => {
      const invalidSchoolData = {
        ...mockSchoolData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schoolType: 'Invalid Type' as any
      };
      
      await expect(schoolService.createSchool(1, invalidSchoolData, 1))
        .rejects.toThrow(BadRequestError);
    });
  });

  describe('getSchoolsByDistrictId', () => {
    const mockSchoolsWithStatus = [
      new School({
        id: 1,
        districtId: 1,
        name: 'Test School 1',
        schoolType: 'High School',
        enrollment: 500,
        overrideDistrictBilling: true,
        statusId: 1,
        isDeleted: false,
        userStatuses: { id: 1, name: 'Active' }
      }),
      new School({
        id: 2,
        districtId: 1,
        name: 'Test School 2',
        schoolType: 'Middle School',
        enrollment: 300,
        overrideDistrictBilling: false,
        statusId: 1,
        isDeleted: false,
        userStatuses: { id: 1, name: 'Active' }
      })
    ];

    beforeEach(() => {
      mockSchoolRepository.findByDistrictIdWithStatus.mockResolvedValue(mockSchoolsWithStatus);
    });

    it('should return schools for a district when user has Group Admin role', async () => {
      const result = await schoolService.getSchoolsByDistrictId(1, 1);
      
      expect(mockUserRepository.getUserDetails).toHaveBeenCalledWith(1);
      expect(mockUserRepository.findDistrictById).toHaveBeenCalledWith(1);
      expect(mockSchoolRepository.findByDistrictIdWithStatus).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSchoolsWithStatus);
    });

    it('should return schools for a district when user has District Admin role', async () => {
      const districtAdminUser = {
        ...mockUser,
        getAdminRoles: jest.fn().mockReturnValue([
          new UserRole({
            id: 1,
            userId: 1,
            roleId: 2,
            scopeId: 1,
            role: new Role({
              id: 2,
              name: 'District Admin',
              categoryId: 1,
              roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
            })
          })
        ])
      } as unknown as User;
      
      mockUserRepository.getUserDetails.mockResolvedValueOnce(districtAdminUser);
      
      const result = await schoolService.getSchoolsByDistrictId(1, 1);
      
      expect(result).toEqual(mockSchoolsWithStatus);
    });

    it('should return schools for a district when user has School Admin role', async () => {
      const schoolAdminUser = {
        ...mockUser,
        getAdminRoles: jest.fn().mockReturnValue([
          new UserRole({
            id: 1,
            userId: 1,
            roleId: 3,
            scopeId: 1,
            role: new Role({
              id: 3,
              name: 'School Admin',
              categoryId: 1,
              roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
            })
          })
        ])
      } as unknown as User;
      
      mockUserRepository.getUserDetails.mockResolvedValueOnce(schoolAdminUser);
      
      const result = await schoolService.getSchoolsByDistrictId(1, 1);
      
      expect(result).toEqual(mockSchoolsWithStatus);
    });

    it('should return schools for a district when user has Viewer role', async () => {
      const viewerUser = {
        ...mockUser,
        getAdminRoles: jest.fn().mockReturnValue([
          new UserRole({
            id: 1,
            userId: 1,
            roleId: 4,
            scopeId: 1,
            role: new Role({
              id: 4,
              name: 'Viewer',
              categoryId: 1,
              roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
            })
          })
        ])
      } as unknown as User;
      
      mockUserRepository.getUserDetails.mockResolvedValueOnce(viewerUser);
      
      const result = await schoolService.getSchoolsByDistrictId(1, 1);
      
      expect(result).toEqual(mockSchoolsWithStatus);
    });

    it('should throw NotFoundError if user is not found', async () => {
      mockUserRepository.getUserDetails.mockResolvedValueOnce(null);
      
      await expect(schoolService.getSchoolsByDistrictId(1, 1))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if user does not have required role', async () => {
      const userWithoutRequiredRole = {
        ...mockUser,
        getAdminRoles: jest.fn().mockReturnValue([
          new UserRole({
            id: 1,
            userId: 1,
            roleId: 5,
            scopeId: 1,
            role: new Role({
              id: 5,
              name: 'Other Role',
              categoryId: 2,
              roleCategory: { id: 2, name: 'Other' }
            })
          })
        ])
      } as unknown as User;
      
      mockUserRepository.getUserDetails.mockResolvedValueOnce(userWithoutRequiredRole);
      
      await expect(schoolService.getSchoolsByDistrictId(1, 1))
        .rejects.toThrow(ForbiddenError);
    });

    it('should throw NotFoundError if district is not found', async () => {
      mockUserRepository.findDistrictById.mockResolvedValueOnce(null);
      
      await expect(schoolService.getSchoolsByDistrictId(1, 1))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError if district does not belong to user organization', async () => {
      mockUserRepository.findDistrictById.mockResolvedValueOnce({
        id: 1,
        cooperativeId: 2 // Different from user's cooperativeId
      });
      
      await expect(schoolService.getSchoolsByDistrictId(1, 1))
        .rejects.toThrow(ForbiddenError);
    });
  });
});
