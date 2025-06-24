import { UserController } from '../../../../src/interfaces/controllers/UserController';
import { IUserService } from '../../../../src/application/contracts/IUserService';
import { Request, Response } from 'express';
import { ForbiddenError } from '../../../../src/domain/core/errors/ForbiddenError';
import { User } from '../../../../src/domain/interfaces/users/User';
import { AuthRequest } from '../../../../src/interfaces/responses/base/AuthRequest';

jest.mock('../../../../src/config/container', () => ({
  container: {
    get: jest.fn()
  }
}));

describe('UserController - inviteUser', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<IUserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockUserService = {
      inviteUser: jest.fn(),
      getUserById: jest.fn(),
      login: jest.fn(),
      passwordReset: jest.fn(),
      requestPasswordResetCode: jest.fn(),
      requestEmailVerificationCode: jest.fn(),
      verifyEmail: jest.fn(),
    } as unknown as jest.Mocked<IUserService>;

    userController = new UserController(mockUserService);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return 403 if user is not authenticated', async () => {
    mockRequest = {
      body: {
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'Group Admin',
      }
    } as Partial<Request>;
    
    Object.defineProperty(mockRequest, 'user', {
      value: undefined,
      writable: true
    });

    const inviteUserMethod = (userController as any).inviteUser.bind(userController);
    await expect(inviteUserMethod(mockRequest as Request, mockResponse as Response))
      .rejects.toThrow(ForbiddenError);
  });

  it('should return 403 if user does not have required role', async () => {
    mockRequest = {
      body: {
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'Group Admin',
      }
    } as Partial<Request>;
    
    const mockAuthUser = {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      cooperativeId: null,
      districtId: 1,
      roles: [
        {
          id: 4,
          type: 'Viewer',
          scope: { id: 1, type: 'District' },
          permissions: []
        }
      ],
      bidRoles: [],
      manageBids: [],
      status: 'Active',
      lastLogin: new Date(),
      demoAccount: false,
      firstName: 'Admin',
      lastName: 'User'
    };
    
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      passwordHash: 'hash',
      firstName: 'Admin',
      lastName: 'User',
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Viewer' } },
      ]),
    } as unknown as User;
    
    Object.defineProperty(mockRequest, 'user', {
      value: mockAuthUser,
      writable: true
    });

    mockUserService.getUserById.mockResolvedValue(mockUser);

    const inviteUserMethod = (userController as any).inviteUser.bind(userController);
    await expect(inviteUserMethod(mockRequest as Request, mockResponse as Response))
      .rejects.toThrow(ForbiddenError);
  });

  it('should return 201 on successful invitation', async () => {
    mockRequest = {
      body: {
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'Group Admin',
        bid_role: 'Bid Administrator',
        district_id: 1,
        school_id: 2,
      }
    } as Partial<Request>;
    
    const mockAuthUser = {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      cooperativeId: null,
      districtId: 1,
      roles: [
        {
          id: 1,
          type: 'Group Admin',
          scope: { id: 1, type: 'District' },
          permissions: []
        }
      ],
      bidRoles: [],
      manageBids: [],
      status: 'Active',
      lastLogin: new Date(),
      demoAccount: false,
      firstName: 'Admin',
      lastName: 'User'
    };
    
    const mockUser = {
      id: 1,
      email: 'admin@example.com',
      passwordHash: 'hash',
      firstName: 'Admin',
      lastName: 'User',
      districtId: 1,
      getAdminRoles: jest.fn().mockReturnValue([
        { role: { name: 'Group Admin' } },
      ]),
    } as unknown as User;
    
    Object.defineProperty(mockRequest, 'user', {
      value: mockAuthUser,
      writable: true
    });

    mockUserService.getUserById.mockResolvedValue(mockUser);
    mockUserService.inviteUser.mockResolvedValue();

    const inviteUserMethod = (userController as any).inviteUser.bind(userController);
    await inviteUserMethod(mockRequest as Request, mockResponse as Response);

    expect(mockUserService.inviteUser).toHaveBeenCalledWith(
      {
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'Group Admin',
        bidRole: 'Bid Administrator',
        districtId: 1,
        schoolId: 2,
      },
      1
    );
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User invitation sent' });
  });
});
