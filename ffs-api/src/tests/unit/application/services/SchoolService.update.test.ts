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

describe('SchoolService - updateSchool', () => {
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

  const mockSchool = new School({
    id: 1,
    districtId: 1,
    name: 'Test School',
    schoolType: 'High School',
    overrideDistrictBilling: true,
    statusId: 1,
    isDeleted: false
  });

  const mockUpdatedSchool = new School({
    id: 1,
    districtId: 1,
    name: 'Updated School Name',
    schoolType: 'Middle School',
    overrideDistrictBilling: false,
    statusId: 1,
    isDeleted: false
  });

  const mockUpdateData = {
    name: 'Updated School Name',
    schoolType: 'Middle School',
    overrideDistrictBilling: false
  };

  beforeEach(() => {
    mockSchoolRepository = {
      create: jest.fn(),
      createWithTransaction: jest.fn(),
      findById: jest.fn(),
      findByDistrictId: jest.fn(),
      findByDistrictIdWithStatus: jest.fn(),
      update: jest.fn(),
      updateWithTransaction: jest.fn(),
      softDelete: jest.fn()
    } as jest.Mocked<ISchoolRepository>;

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
    } as jest.Mocked<IUserRepository>;

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

    mockSchoolRepository.findById.mockResolvedValue(mockSchool);
    mockSchoolRepository.update.mockResolvedValue(mockUpdatedSchool);
    mockSchoolRepository.updateWithTransaction.mockResolvedValue(mockUpdatedSchool);
  });

  it('should update a school successfully with valid data and permissions', async () => {
    const result = await schoolService.updateSchool(1, 1, mockUpdateData, 1);
    
    expect(mockUserRepository.getUserDetails).toHaveBeenCalledWith(1);
    expect(mockUserRepository.findDistrictById).toHaveBeenCalledWith(1);
    expect(mockSchoolRepository.findById).toHaveBeenCalledWith(1);
    expect(mockSchoolRepository.updateWithTransaction).toHaveBeenCalled();
    expect(result).toEqual(mockUpdatedSchool);
  });

  it('should throw NotFoundError if user is not found', async () => {
    mockUserRepository.getUserDetails.mockResolvedValueOnce(null);
    
    await expect(schoolService.updateSchool(1, 1, mockUpdateData, 1))
      .rejects.toThrow(NotFoundError);
  });

  it('should throw ForbiddenError if user does not have required role', async () => {
    const userWithoutAdminRole = {
      ...mockUser,
      getAdminRoles: jest.fn().mockReturnValue([])
    } as unknown as User;
    
    mockUserRepository.getUserDetails.mockResolvedValueOnce(userWithoutAdminRole);
    
    await expect(schoolService.updateSchool(1, 1, mockUpdateData, 1))
      .rejects.toThrow(ForbiddenError);
  });

  it('should throw NotFoundError if district is not found', async () => {
    mockUserRepository.findDistrictById.mockResolvedValueOnce(null);
    
    await expect(schoolService.updateSchool(1, 1, mockUpdateData, 1))
      .rejects.toThrow(NotFoundError);
  });

  it('should throw ForbiddenError if district does not belong to user organization', async () => {
    mockUserRepository.findDistrictById.mockResolvedValueOnce({
      id: 1,
      cooperativeId: 2 // Different from user's cooperativeId
    });
    
    await expect(schoolService.updateSchool(1, 1, mockUpdateData, 1))
      .rejects.toThrow(ForbiddenError);
  });

  it('should throw NotFoundError if school is not found', async () => {
    mockSchoolRepository.findById.mockResolvedValueOnce(null);
    
    await expect(schoolService.updateSchool(1, 1, mockUpdateData, 1))
      .rejects.toThrow(NotFoundError);
  });

  it('should throw ForbiddenError if school does not belong to the specified district', async () => {
    const schoolFromDifferentDistrict = new School({
      ...mockSchool,
      districtId: 2 // Different from the requested districtId
    });
    
    mockSchoolRepository.findById.mockResolvedValueOnce(schoolFromDifferentDistrict);
    
    await expect(schoolService.updateSchool(1, 1, mockUpdateData, 1))
      .rejects.toThrow(ForbiddenError);
  });

  it('should throw NotFoundError if school has been deleted', async () => {
    const deletedSchool = new School({
      ...mockSchool,
      isDeleted: true
    });
    
    mockSchoolRepository.findById.mockResolvedValueOnce(deletedSchool);
    
    await expect(schoolService.updateSchool(1, 1, mockUpdateData, 1))
      .rejects.toThrow(NotFoundError);
  });

  it('should throw BadRequestError if school type is invalid', async () => {
    const invalidUpdateData = {
      ...mockUpdateData,
      schoolType: 'Invalid Type'
    };
    
    await expect(schoolService.updateSchool(1, 1, invalidUpdateData, 1))
      .rejects.toThrow(BadRequestError);
  });

  it('should update only the provided fields', async () => {
    const partialUpdateData = {
      name: 'Updated School Name'
    };
    
    await schoolService.updateSchool(1, 1, partialUpdateData, 1);
    
    expect(mockSchoolRepository.updateWithTransaction).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        id: 1,
        name: 'Updated School Name'
      })
    );
  });

  it('should allow District Admin role to update a school', async () => {
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
    
    const result = await schoolService.updateSchool(1, 1, mockUpdateData, 1);
    
    expect(result).toEqual(mockUpdatedSchool);
  });

  it('should allow School Admin role to update a school', async () => {
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
    
    const result = await schoolService.updateSchool(1, 1, mockUpdateData, 1);
    
    expect(result).toEqual(mockUpdatedSchool);
  });

  it('should throw BadRequestError if update fails', async () => {
    mockSchoolRepository.updateWithTransaction.mockResolvedValueOnce(null);
    
    await expect(schoolService.updateSchool(1, 1, mockUpdateData, 1))
      .rejects.toThrow(BadRequestError);
  });
});
