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
import { UserStatus } from '../../../../domain/interfaces/userStatuses/UserStatus';

describe('SchoolService.archiveSchool', () => {
  let schoolService: SchoolService;
  let mockSchoolRepository: jest.Mocked<ISchoolRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockContactRepository: jest.Mocked<IContactRepository>;
  let mockOrganizationContactRepository: jest.Mocked<IOrganizationContactRepository>;
  let mockDatabaseService: jest.Mocked<IDatabaseService>;
  let mockDistrictRepository: jest.Mocked<IDistrictRepository>;

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
    } as jest.Mocked<ISchoolRepository>;

    mockUserRepository = {
      getUserDetails: jest.fn(),
      findDistrictById: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

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
      mockSchoolRepository,
      mockUserRepository,
      mockContactRepository,
      mockOrganizationContactRepository,
      mockDatabaseService,
      mockDistrictRepository
    );
  });

  it('should archive a school successfully with Group Admin role', async () => {
    const userId = 1;
    const districtId = 1;
    const schoolId = 1;


    const mockUser = new User({
      id: userId,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      userStatus: { id: 1, name: 'Active' } as UserStatus,
      demoAccount: false,
      statusId: 1,
      isDeleted: false,
      passwordHash: 'hash',
      emailVerified: true,
      cooperativeId: 1,
      userRoles: [
        new UserRole({
          id: 1,
          userId,
          roleId: 1,
          scopeId: 1,
          role: new Role({
            id: 1,
            name: 'Group Admin',
            categoryId: 1,
            roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
          })
        })
      ]
    });

    const mockDistrict = {
      id: districtId,
      cooperativeId: 1,
      name: 'Test District',
    };

    const mockSchool = new School({
      id: schoolId,
      districtId,
      name: 'Test School',
      schoolType: 'High School',
      statusId: 1,
      isDeleted: false,
      overrideDistrictBilling: false,
    });

    const updatedSchool = new School({
      ...mockSchool,
      statusId: 2,
    });

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict);
    mockSchoolRepository.findById.mockResolvedValue(mockSchool);
    mockSchoolRepository.update.mockResolvedValue(updatedSchool);

    await schoolService.archiveSchool(districtId, schoolId, userId);

    expect(mockUserRepository.getUserDetails).toHaveBeenCalledWith(userId);
    expect(mockUserRepository.findDistrictById).toHaveBeenCalledWith(districtId);
    expect(mockSchoolRepository.findById).toHaveBeenCalledWith(schoolId);
    expect(mockSchoolRepository.update).toHaveBeenCalledWith(expect.objectContaining({
      id: schoolId,
      statusId: 2
    }));
  });

  it('should archive a school successfully with District Admin role', async () => {
    const userId = 1;
    const districtId = 1;
    const schoolId = 1;


    const mockUser = new User({
      id: userId,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      userStatus: { id: 1, name: 'Active' } as UserStatus,
      demoAccount: false,
      statusId: 1,
      isDeleted: false,
      passwordHash: 'hash',
      emailVerified: true,
      cooperativeId: 1,
      userRoles: [
        new UserRole({
          id: 1,
          userId,
          roleId: 2,
          scopeId: 1,
          role: new Role({
            id: 2,
            name: 'District Admin',
            categoryId: 1,
            roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
          })
        })
      ]
    });

    const mockDistrict = {
      id: districtId,
      cooperativeId: 1,
      name: 'Test District',
    };

    const mockSchool = new School({
      id: schoolId,
      districtId,
      name: 'Test School',
      schoolType: 'High School',
      statusId: 1,
      isDeleted: false,
      overrideDistrictBilling: false,
    });

    const updatedSchool = new School({
      ...mockSchool,
      statusId: 2,
    });

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict);
    mockSchoolRepository.findById.mockResolvedValue(mockSchool);
    mockSchoolRepository.update.mockResolvedValue(updatedSchool);

    await schoolService.archiveSchool(districtId, schoolId, userId);

    expect(mockSchoolRepository.update).toHaveBeenCalledWith(expect.objectContaining({
      id: schoolId,
      statusId: 2
    }));
  });

  it('should archive a school successfully with School Admin role', async () => {
    const userId = 1;
    const districtId = 1;
    const schoolId = 1;


    const mockUser = new User({
      id: userId,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      userStatus: { id: 1, name: 'Active' } as UserStatus,
      demoAccount: false,
      statusId: 1,
      isDeleted: false,
      passwordHash: 'hash',
      emailVerified: true,
      cooperativeId: 1,
      userRoles: [
        new UserRole({
          id: 1,
          userId,
          roleId: 3,
          scopeId: 1,
          role: new Role({
            id: 3,
            name: 'School Admin',
            categoryId: 1,
            roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
          })
        })
      ]
    });

    const mockDistrict = {
      id: districtId,
      cooperativeId: 1,
      name: 'Test District',
    };

    const mockSchool = new School({
      id: schoolId,
      districtId,
      name: 'Test School',
      schoolType: 'High School',
      statusId: 1,
      isDeleted: false,
      overrideDistrictBilling: false,
    });

    const updatedSchool = new School({
      ...mockSchool,
      statusId: 2,
    });

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict);
    mockSchoolRepository.findById.mockResolvedValue(mockSchool);
    mockSchoolRepository.update.mockResolvedValue(updatedSchool);

    await schoolService.archiveSchool(districtId, schoolId, userId);

    expect(mockSchoolRepository.update).toHaveBeenCalledWith(expect.objectContaining({
      id: schoolId,
      statusId: 2
    }));
  });

  it('should throw ForbiddenError when user lacks required role', async () => {
    const userId = 1;
    const districtId = 1;
    const schoolId = 1;


    const mockUser = new User({
      id: userId,
      email: 'user@example.com',
      firstName: 'Regular',
      lastName: 'User',
      userStatus: { id: 1, name: 'Active' } as UserStatus,
      demoAccount: false,
      statusId: 1,
      isDeleted: false,
      passwordHash: 'hash',
      emailVerified: true,
      cooperativeId: 1,
      userRoles: [
        new UserRole({
          id: 1,
          userId,
          roleId: 4,
          scopeId: 1,
          role: new Role({
            id: 4,
            name: 'Viewer',
            categoryId: 1,
            roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
          })
        })
      ]
    });

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);

    await expect(schoolService.archiveSchool(districtId, schoolId, userId))
      .rejects.toThrow(ForbiddenError);
    expect(mockUserRepository.getUserDetails).toHaveBeenCalledWith(userId);
  });

  it('should throw NotFoundError when user does not exist', async () => {
    const userId = 999;
    const districtId = 1;
    const schoolId = 1;

    mockUserRepository.getUserDetails.mockResolvedValue(null);

    await expect(schoolService.archiveSchool(districtId, schoolId, userId))
      .rejects.toThrow(NotFoundError);
    expect(mockUserRepository.getUserDetails).toHaveBeenCalledWith(userId);
  });

  it('should throw NotFoundError when district does not exist', async () => {
    const userId = 1;
    const districtId = 999;
    const schoolId = 1;


    const mockUser = new User({
      id: userId,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      userStatus: { id: 1, name: 'Active' } as UserStatus,
      demoAccount: false,
      statusId: 1,
      isDeleted: false,
      passwordHash: 'hash',
      emailVerified: true,
      cooperativeId: 1,
      userRoles: [
        new UserRole({
          id: 1,
          userId,
          roleId: 1,
          scopeId: 1,
          role: new Role({
            id: 1,
            name: 'Group Admin',
            categoryId: 1,
            roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
          })
        })
      ]
    });

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
    mockUserRepository.findDistrictById.mockResolvedValue(null);

    await expect(schoolService.archiveSchool(districtId, schoolId, userId))
      .rejects.toThrow(NotFoundError);
    expect(mockUserRepository.findDistrictById).toHaveBeenCalledWith(districtId);
  });

  it('should throw ForbiddenError when district does not belong to user organization', async () => {
    const userId = 1;
    const districtId = 1;
    const schoolId = 1;

    const districtOrganizationId = 2; // Different organization

    const mockUser = new User({
      id: userId,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      userStatus: { id: 1, name: 'Active' } as UserStatus,
      demoAccount: false,
      statusId: 1,
      isDeleted: false,
      passwordHash: 'hash',
      emailVerified: true,
      cooperativeId: 1,
      userRoles: [
        new UserRole({
          id: 1,
          userId,
          roleId: 1,
          scopeId: 1,
          role: new Role({
            id: 1,
            name: 'Group Admin',
            categoryId: 1,
            roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
          })
        })
      ]
    });

    const mockDistrict = {
      id: districtId,
      cooperativeId: districtOrganizationId, // Different organization
      name: 'Test District',
    };

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict);

    await expect(schoolService.archiveSchool(districtId, schoolId, userId))
      .rejects.toThrow(ForbiddenError);
  });

  it('should throw NotFoundError when school does not exist', async () => {
    const userId = 1;
    const districtId = 1;
    const schoolId = 999;


    const mockUser = new User({
      id: userId,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      userStatus: { id: 1, name: 'Active' } as UserStatus,
      demoAccount: false,
      statusId: 1,
      isDeleted: false,
      passwordHash: 'hash',
      emailVerified: true,
      cooperativeId: 1,
      userRoles: [
        new UserRole({
          id: 1,
          userId,
          roleId: 1,
          scopeId: 1,
          role: new Role({
            id: 1,
            name: 'Group Admin',
            categoryId: 1,
            roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
          })
        })
      ]
    });

    const mockDistrict = {
      id: districtId,
      cooperativeId: 1,
      name: 'Test District',
    };

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict);
    mockSchoolRepository.findById.mockResolvedValue(null);

    await expect(schoolService.archiveSchool(districtId, schoolId, userId))
      .rejects.toThrow(NotFoundError);
    expect(mockSchoolRepository.findById).toHaveBeenCalledWith(schoolId);
  });

  it('should throw ForbiddenError when school does not belong to specified district', async () => {
    const userId = 1;
    const districtId = 1;
    const schoolId = 1;

    const schoolDistrictId = 2; // Different district

    const mockUser = new User({
      id: userId,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      userStatus: { id: 1, name: 'Active' } as UserStatus,
      demoAccount: false,
      statusId: 1,
      isDeleted: false,
      passwordHash: 'hash',
      emailVerified: true,
      cooperativeId: 1,
      userRoles: [
        new UserRole({
          id: 1,
          userId,
          roleId: 1,
          scopeId: 1,
          role: new Role({
            id: 1,
            name: 'Group Admin',
            categoryId: 1,
            roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
          })
        })
      ]
    });

    const mockDistrict = {
      id: districtId,
      cooperativeId: 1,
      name: 'Test District',
    };

    const mockSchool = new School({
      id: schoolId,
      districtId: schoolDistrictId, // Different district
      name: 'Test School',
      schoolType: 'High School',
      statusId: 1,
      isDeleted: false,
      overrideDistrictBilling: false,
    });

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict);
    mockSchoolRepository.findById.mockResolvedValue(mockSchool);

    await expect(schoolService.archiveSchool(districtId, schoolId, userId))
      .rejects.toThrow(ForbiddenError);
  });

  it('should throw NotFoundError when school is already deleted', async () => {
    const userId = 1;
    const districtId = 1;
    const schoolId = 1;


    const mockUser = new User({
      id: userId,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      userStatus: { id: 1, name: 'Active' } as UserStatus,
      demoAccount: false,
      statusId: 1,
      isDeleted: false,
      passwordHash: 'hash',
      emailVerified: true,
      cooperativeId: 1,
      userRoles: [
        new UserRole({
          id: 1,
          userId,
          roleId: 1,
          scopeId: 1,
          role: new Role({
            id: 1,
            name: 'Group Admin',
            categoryId: 1,
            roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
          })
        })
      ]
    });

    const mockDistrict = {
      id: districtId,
      cooperativeId: 1,
      name: 'Test District',
    };

    const mockSchool = new School({
      id: schoolId,
      districtId,
      name: 'Test School',
      schoolType: 'High School',
      statusId: 1,
      isDeleted: true, // Already deleted
      overrideDistrictBilling: false,
    });

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict);
    mockSchoolRepository.findById.mockResolvedValue(mockSchool);

    await expect(schoolService.archiveSchool(districtId, schoolId, userId))
      .rejects.toThrow(NotFoundError);
  });

  it('should throw BadRequestError when repository update fails', async () => {
    const userId = 1;
    const districtId = 1;
    const schoolId = 1;


    const mockUser = new User({
      id: userId,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      userStatus: { id: 1, name: 'Active' } as UserStatus,
      demoAccount: false,
      statusId: 1,
      isDeleted: false,
      passwordHash: 'hash',
      emailVerified: true,
      cooperativeId: 1,
      userRoles: [
        new UserRole({
          id: 1,
          userId,
          roleId: 1,
          scopeId: 1,
          role: new Role({
            id: 1,
            name: 'Group Admin',
            categoryId: 1,
            roleCategory: { id: 1, name: RoleCategoryEnum.ADMIN }
          })
        })
      ]
    });

    const mockDistrict = {
      id: districtId,
      cooperativeId: 1,
      name: 'Test District',
    };

    const mockSchool = new School({
      id: schoolId,
      districtId,
      name: 'Test School',
      schoolType: 'High School',
      statusId: 1,

      isDeleted: false,
      overrideDistrictBilling: false,
    });

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict);
    mockSchoolRepository.findById.mockResolvedValue(mockSchool);
    mockSchoolRepository.update.mockResolvedValue(null); // Update fails

    await expect(schoolService.archiveSchool(districtId, schoolId, userId))
      .rejects.toThrow(BadRequestError);
    expect(mockSchoolRepository.update).toHaveBeenCalled();
  });
});
