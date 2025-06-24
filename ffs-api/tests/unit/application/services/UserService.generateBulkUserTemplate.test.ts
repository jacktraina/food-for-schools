import { UserService } from '../../../../src/application/services/UserService';
import { IUserRepository } from '../../../../src/domain/interfaces/users/IUserRepository';
import { User } from '../../../../src/domain/interfaces/users/User';
import { ForbiddenError } from '../../../../src/domain/core/errors/ForbiddenError';
import { generateBulkUserTemplate } from '../../../../src/shared/utils/csvGenerator';
import { UserRole } from '../../../../src/domain/interfaces/userRoles/UserRole';

jest.mock('../../../../src/shared/utils/csvGenerator', () => ({
  generateBulkUserTemplate: jest.fn().mockReturnValue('email,full_name,role,bid_role,district_id,school_id\n')
}));

describe('UserService.generateBulkUserTemplate', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockUser: jest.Mocked<User>;

  beforeEach(() => {
    mockUserRepository = {
      getUserDetails: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    mockUser = {
      getAdminRoles: jest.fn(),
    } as unknown as jest.Mocked<User>;

    userService = new UserService(
      mockUserRepository,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );
  });

  it('should throw ForbiddenError if user not found', async () => {
    mockUserRepository.getUserDetails.mockResolvedValue(null);

    await expect(userService.generateBulkUserTemplate(1)).rejects.toThrow(
      new ForbiddenError('User not found')
    );
  });

  it('should throw ForbiddenError if user does not have required role', async () => {
    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
    const mockUserRole = new UserRole({ 
      id: 1, 
      userId: 1, 
      roleId: 1, 
      scopeId: 1, 
      role: { name: 'School Admin', roleCategory: { name: 'ADMIN' } } 
    });
    mockUser.getAdminRoles.mockReturnValue([mockUserRole]);

    await expect(userService.generateBulkUserTemplate(1)).rejects.toThrow(
      new ForbiddenError('You do not have permission to download bulk upload template')
    );
  });

  it('should return CSV template if user has Super-Admin role', async () => {
    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
    const mockUserRole = new UserRole({ 
      id: 1, 
      userId: 1, 
      roleId: 1, 
      scopeId: 1, 
      role: { name: 'Super-Admin', roleCategory: { name: 'ADMIN' } } 
    });
    mockUser.getAdminRoles.mockReturnValue([mockUserRole]);

    const result = await userService.generateBulkUserTemplate(1);
    expect(result).toBe('email,full_name,role,bid_role,district_id,school_id\n');
    expect(generateBulkUserTemplate).toHaveBeenCalled();
  });

  it('should return CSV template if user has Group Admin role', async () => {
    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
    const mockUserRole = new UserRole({ 
      id: 1, 
      userId: 1, 
      roleId: 1, 
      scopeId: 1, 
      role: { name: 'Group Admin', roleCategory: { name: 'ADMIN' } } 
    });
    mockUser.getAdminRoles.mockReturnValue([mockUserRole]);

    const result = await userService.generateBulkUserTemplate(1);
    expect(result).toBe('email,full_name,role,bid_role,district_id,school_id\n');
    expect(generateBulkUserTemplate).toHaveBeenCalled();
  });

  it('should return CSV template if user has District Admin role', async () => {
    mockUserRepository.getUserDetails.mockResolvedValue(mockUser);
    const mockUserRole = new UserRole({ 
      id: 1, 
      userId: 1, 
      roleId: 1, 
      scopeId: 1, 
      role: { name: 'District Admin', roleCategory: { name: 'ADMIN' } } 
    });
    mockUser.getAdminRoles.mockReturnValue([mockUserRole]);

    const result = await userService.generateBulkUserTemplate(1);
    expect(result).toBe('email,full_name,role,bid_role,district_id,school_id\n');
    expect(generateBulkUserTemplate).toHaveBeenCalled();
  });
});
