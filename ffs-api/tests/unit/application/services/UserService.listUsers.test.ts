import { UserService } from '../../../../src/application/services/UserService';
import { IUserRepository } from '../../../../src/domain/interfaces/users/IUserRepository';
import { ForbiddenError } from '../../../../src/domain/core/errors/ForbiddenError';
import { User } from '../../../../src/domain/interfaces/users/User';

describe('UserService - listUsers', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      getUserDetails: jest.fn(),
      findAllUsers: jest.fn(),
      searchUsers: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      findDistrictById: jest.fn(),
      create: jest.fn(),
      updatePassword: jest.fn(),
      markAsEmailVerified: jest.fn(),
      findManyByIds: jest.fn(),
      softDelete: jest.fn()
    };

    userService = new UserService(
      mockUserRepository,
      {} as any, // mockEmailVerificationCodeRepository
      {} as any, // mockEmailService
      {} as any, // mockOneSignalService
      {} as any, // mockEmailTemplates
      {} as any, // mockPasswordResetCodeRepository
      {} as any, // mockInvitationRepository
      {} as any  // mockBulkUploadRepository
    );
  });

  it('should successfully list users for Super-Admin', async () => {
    const requestingUser = {
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Super-Admin' } }
      ])
    };
    const users = [
      {
        id: 1,
        email: 'user1@test.com',
        firstName: 'John',
        lastName: 'Doe',
        userStatus: { name: 'Active' },
        lastLogin: new Date(),
        getAdminRoles: jest.fn().mockReturnValue([{ role: { name: 'Admin' } }]),
        getBidRoles: jest.fn().mockReturnValue([]),
        userRoles: []
      }
    ];

    mockUserRepository.getUserDetails.mockResolvedValue(requestingUser as any);
    mockUserRepository.findAllUsers.mockResolvedValue(users as any);

    const result = await userService.listUsers(1);

    expect(result).toHaveLength(1);
    expect(result[0].email).toBe('user1@test.com');
    expect(mockUserRepository.getUserDetails).toHaveBeenCalledWith(1);
    expect(mockUserRepository.findAllUsers).toHaveBeenCalled();
  });

  it('should throw ForbiddenError for unauthorized user', async () => {
    const requestingUser = {
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Viewer' } }
      ])
    };

    mockUserRepository.getUserDetails.mockResolvedValue(requestingUser as any);

    await expect(userService.listUsers(1)).rejects.toThrow(ForbiddenError);
  });

  it('should throw ForbiddenError when user not found', async () => {
    mockUserRepository.getUserDetails.mockResolvedValue(null);

    await expect(userService.listUsers(1)).rejects.toThrow(ForbiddenError);
  });
});
