import { SchoolService } from '../../../../src/application/services/SchoolService';
import { ISchoolRepository } from '../../../../src/domain/interfaces/Schools/ISchoolRepository';
import { IUserRepository } from '../../../../src/domain/interfaces/users/IUserRepository';
import { IContactRepository } from '../../../../src/domain/interfaces/Contacts/IContactRepository';
import { IOrganizationContactRepository } from '../../../../src/domain/interfaces/OrganizationContacts/IOrganizationContactRepository';
import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { IDistrictRepository } from '../../../../src/domain/interfaces/Districts/IDistrictRepository';
import { NotFoundError } from '../../../../src/domain/core/errors/NotFoundError';
import { ForbiddenError } from '../../../../src/domain/core/errors/ForbiddenError';
import { School } from '../../../../src/domain/interfaces/Schools/School';

describe('SchoolService - deleteSchool', () => {
  const mockSchoolRepository = {
    create: jest.fn(),
    createWithTransaction: jest.fn(),
    findById: jest.fn(),
    findByDistrictId: jest.fn(),
    findByDistrictIdWithStatus: jest.fn(),
    update: jest.fn(),
    updateWithTransaction: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockUserRepository = {
    getUserDetails: jest.fn(),
    findDistrictById: jest.fn(),
  };

  const mockContactRepository = {
    create: jest.fn(),
    createWithTransaction: jest.fn(),
    updateWithTransaction: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockOrganizationContactRepository = {
    create: jest.fn(),
    createWithTransaction: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockDatabaseService = {
    runInTransaction: jest.fn(),
  };

  const mockDistrictRepository = {
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

  let service: SchoolService;

  beforeEach(() => {
    service = new SchoolService(
      mockSchoolRepository as unknown as ISchoolRepository,
      mockUserRepository as unknown as IUserRepository,
      mockContactRepository as any,
      mockOrganizationContactRepository as any,
      mockDatabaseService as any,
      mockDistrictRepository as any
    );
    jest.clearAllMocks();
  });

  it('should soft delete a school when user has Group Admin role', async () => {
    const mockUser = {
      id: 1,
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Group Admin' } }
      ])
    };

    const mockDistrict = {
      id: 10,
      cooperativeId: 1
    };

    const mockSchool = new School({
      id: 100,
      districtId: 10,
      name: 'Test School',
      schoolType: 'Elementary School',
      statusId: 1,

      isDeleted: false,
      overrideDistrictBilling: false
    });

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser as any);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict as any);
    mockSchoolRepository.findById.mockResolvedValue(mockSchool);

    await service.deleteSchool(10, 100, 1);

    expect(mockSchoolRepository.softDelete).toHaveBeenCalledWith(100);
  });

  it('should soft delete a school when user has District Admin role', async () => {
    const mockUser = {
      id: 1,
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'District Admin' } }
      ])
    };

    const mockDistrict = {
      id: 10,
      cooperativeId: 1
    };

    const mockSchool = new School({
      id: 100,
      districtId: 10,
      name: 'Test School',
      schoolType: 'Elementary School',
      statusId: 1,

      isDeleted: false,
      overrideDistrictBilling: false
    });

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser as any);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict as any);
    mockSchoolRepository.findById.mockResolvedValue(mockSchool);

    await service.deleteSchool(10, 100, 1);

    expect(mockSchoolRepository.softDelete).toHaveBeenCalledWith(100);
  });

  it('should soft delete a school when user has School Admin role', async () => {
    const mockUser = {
      id: 1,
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'School Admin' } }
      ])
    };

    const mockDistrict = {
      id: 10,
      cooperativeId: 1
    };

    const mockSchool = new School({
      id: 100,
      districtId: 10,
      name: 'Test School',
      schoolType: 'Elementary School',
      statusId: 1,

      isDeleted: false,
      overrideDistrictBilling: false
    });

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser as any);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict as any);
    mockSchoolRepository.findById.mockResolvedValue(mockSchool);

    await service.deleteSchool(10, 100, 1);

    expect(mockSchoolRepository.softDelete).toHaveBeenCalledWith(100);
  });

  it('should throw ForbiddenError when user does not have required role', async () => {
    const mockUser = {
      id: 1,
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Viewer' } }
      ])
    };

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser as any);

    await expect(service.deleteSchool(10, 100, 1)).rejects.toThrow(ForbiddenError);
    expect(mockSchoolRepository.softDelete).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when user is not found', async () => {
    mockUserRepository.getUserDetails.mockResolvedValue(null);

    await expect(service.deleteSchool(10, 100, 1)).rejects.toThrow(NotFoundError);
    expect(mockSchoolRepository.softDelete).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when district is not found', async () => {
    const mockUser = {
      id: 1,
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Group Admin' } }
      ])
    };

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser as any);
    mockUserRepository.findDistrictById.mockResolvedValue(null);

    await expect(service.deleteSchool(10, 100, 1)).rejects.toThrow(NotFoundError);
    expect(mockSchoolRepository.softDelete).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when district does not belong to user organization', async () => {
    const mockUser = {
      id: 1,
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Group Admin' } }
      ])
    };

    const mockDistrict = {
      id: 10,
      cooperativeId: 2 // Different from user's organization
    };

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser as any);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict as any);

    await expect(service.deleteSchool(10, 100, 1)).rejects.toThrow(ForbiddenError);
    expect(mockSchoolRepository.softDelete).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when school is not found', async () => {
    const mockUser = {
      id: 1,
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Group Admin' } }
      ])
    };

    const mockDistrict = {
      id: 10,
      cooperativeId: 1
    };

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser as any);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict as any);
    mockSchoolRepository.findById.mockResolvedValue(null);

    await expect(service.deleteSchool(10, 100, 1)).rejects.toThrow(NotFoundError);
    expect(mockSchoolRepository.softDelete).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenError when school does not belong to the specified district', async () => {
    const mockUser = {
      id: 1,
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Group Admin' } }
      ])
    };

    const mockDistrict = {
      id: 10,
      cooperativeId: 1
    };

    const mockSchool = new School({
      id: 100,
      districtId: 20, // Different from requested district
      name: 'Test School',
      schoolType: 'Elementary School',
      statusId: 1,

      isDeleted: false,
      overrideDistrictBilling: false
    });

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser as any);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict as any);
    mockSchoolRepository.findById.mockResolvedValue(mockSchool);

    await expect(service.deleteSchool(10, 100, 1)).rejects.toThrow(ForbiddenError);
    expect(mockSchoolRepository.softDelete).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when school is already deleted', async () => {
    const mockUser = {
      id: 1,
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Group Admin' } }
      ])
    };

    const mockDistrict = {
      id: 10,
      cooperativeId: 1
    };

    const mockSchool = new School({
      id: 100,
      districtId: 10,
      name: 'Test School',
      schoolType: 'Elementary School',
      statusId: 1,

      isDeleted: true, // Already deleted
      overrideDistrictBilling: false
    });

    mockUserRepository.getUserDetails.mockResolvedValue(mockUser as any);
    mockUserRepository.findDistrictById.mockResolvedValue(mockDistrict as any);
    mockSchoolRepository.findById.mockResolvedValue(mockSchool);

    await expect(service.deleteSchool(10, 100, 1)).rejects.toThrow(NotFoundError);
    expect(mockSchoolRepository.softDelete).not.toHaveBeenCalled();
  });
});
