import { UserController } from '../../../../src/interfaces/controllers/UserController';
import { IUserService } from '../../../../src/application/contracts/IUserService';
import { Request, Response } from 'express';
import { ForbiddenError } from '../../../../src/domain/core/errors/ForbiddenError';
import { User } from '../../../../src/domain/interfaces/users/User';
import { AuthRequest } from '../../../../src/interfaces/responses/base/AuthRequest';
import { ListUsersResponse } from '../../../../src/interfaces/responses/users/ListUsersResponse';

jest.mock('../../../../src/config/container', () => ({
  container: {
    get: jest.fn()
  }
}));

describe('UserController - listUsers', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<IUserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockUserService = {
      listUsers: jest.fn(),
      getUserById: jest.fn(),
      login: jest.fn(),
      passwordReset: jest.fn(),
      requestPasswordResetCode: jest.fn(),
      requestEmailVerificationCode: jest.fn(),
      verifyEmail: jest.fn(),
      inviteUser: jest.fn(),
    } as unknown as jest.Mocked<IUserService>;

    userController = new UserController(mockUserService);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return 403 if user is not authenticated', async () => {
    mockRequest = {} as Partial<Request>;
    
    Object.defineProperty(mockRequest, 'user', {
      value: undefined,
      writable: true
    });

    const listUsersMethod = (userController as any).listUsers.bind(userController);
    await expect(listUsersMethod(mockRequest as Request, mockResponse as Response))
      .rejects.toThrow(ForbiddenError);
  });

  it('should return 403 if user does not have required role', async () => {
    mockRequest = {} as Partial<Request>;
    
    const mockUser = {
      id: 1,
      email: 'viewer@example.com',
      passwordHash: 'hash',
      firstName: 'Viewer',
      lastName: 'User',
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Viewer' } },
      ]),
    } as unknown as User;
    
    Object.defineProperty(mockRequest, 'user', {
      value: mockUser,
      writable: true
    });

    mockUserService.listUsers.mockRejectedValue(new ForbiddenError('You do not have permission to list users'));

    const listUsersMethod = (userController as any).listUsers.bind(userController);
    await expect(listUsersMethod(mockRequest as Request, mockResponse as Response))
      .rejects.toThrow(ForbiddenError);
  });

  it('should successfully return users list for Super-Admin', async () => {
    mockRequest = {} as Partial<Request>;
    
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      passwordHash: 'hash',
      firstName: 'Admin',
      lastName: 'User',
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Super-Admin' } },
      ]),
    } as unknown as User;
    
    Object.defineProperty(mockRequest, 'user', {
      value: mockUser,
      writable: true
    });

    const mockUsersList: ListUsersResponse = [
      {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        roles: [
          {
            type: 'Super-Admin',
            scope: {
              type: 'platform',
              id: '1',
              name: 'Platform'
            },
            permissions: ['read', 'write', 'delete']
          }
        ],
        bidRoles: [],
        managedBids: [],
        status: 'Active',
        lastLogin: '2025-05-29T14:00:00.000Z',
        demoAccount: false
      },
      {
        id: '2',
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@example.com',
        roles: [
          {
            type: 'Viewer',
            scope: {
              type: 'district',
              id: '1',
              name: 'Test District'
            },
            permissions: ['read']
          }
        ],
        bidRoles: [
          {
            type: 'Bid Viewer',
            scope: {
              type: 'school',
              id: '1',
              name: 'Test School'
            },
            permissions: ['read']
          }
        ],
        managedBids: [],
        status: 'Active',
        lastLogin: '2025-05-28T10:00:00.000Z',
        demoAccount: false
      }
    ];

    mockUserService.listUsers.mockResolvedValue(mockUsersList);

    const listUsersMethod = (userController as any).listUsers.bind(userController);
    await listUsersMethod(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.listUsers).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockUsersList);
  });

  it('should successfully return users list for Group Admin', async () => {
    mockRequest = {} as Partial<Request>;
    
    const mockUser = {
      id: 1,
      email: 'groupadmin@example.com',
      passwordHash: 'hash',
      firstName: 'Group',
      lastName: 'Admin',
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Group Admin' } },
      ]),
    } as unknown as User;
    
    Object.defineProperty(mockRequest, 'user', {
      value: mockUser,
      writable: true
    });

    const mockUsersList: ListUsersResponse = [
      {
        id: '1',
        firstName: 'Group',
        lastName: 'Admin',
        email: 'groupadmin@example.com',
        roles: [
          {
            type: 'Group Admin',
            scope: {
              type: 'coop',
              id: '1',
              name: 'Test Coop'
            },
            permissions: ['read', 'write']
          }
        ],
        bidRoles: [],
        managedBids: [],
        status: 'Active',
        lastLogin: '2025-05-29T14:00:00.000Z',
        demoAccount: false
      }
    ];

    mockUserService.listUsers.mockResolvedValue(mockUsersList);

    const listUsersMethod = (userController as any).listUsers.bind(userController);
    await listUsersMethod(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.listUsers).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockUsersList);
  });

  it('should successfully return users list for District Admin', async () => {
    mockRequest = {} as Partial<Request>;
    
    const mockUser = {
      id: 1,
      email: 'districtadmin@example.com',
      passwordHash: 'hash',
      firstName: 'District',
      lastName: 'Admin',
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'District Admin' } },
      ]),
    } as unknown as User;
    
    Object.defineProperty(mockRequest, 'user', {
      value: mockUser,
      writable: true
    });

    const mockUsersList: ListUsersResponse = [
      {
        id: '1',
        firstName: 'District',
        lastName: 'Admin',
        email: 'districtadmin@example.com',
        roles: [
          {
            type: 'District Admin',
            scope: {
              type: 'district',
              id: '1',
              name: 'Test District'
            },
            permissions: ['read', 'write']
          }
        ],
        bidRoles: [],
        managedBids: [],
        status: 'Active',
        lastLogin: '2025-05-29T14:00:00.000Z',
        demoAccount: false
      }
    ];

    mockUserService.listUsers.mockResolvedValue(mockUsersList);

    const listUsersMethod = (userController as any).listUsers.bind(userController);
    await listUsersMethod(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.listUsers).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockUsersList);
  });
});
