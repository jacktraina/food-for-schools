import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../../../src/shared/utils/authenticateToken';
import { AppError } from '../../../../src/interfaces/middleware/errorHandler';
import { container } from '../../../../src/config/container';
import { config } from '../../../../src/config/env';
import TYPES from '../../../../src/shared/dependencyInjection/types';
import { fakeUser } from '../../../mocks/mockUser';

jest.mock('jsonwebtoken');
jest.mock('../../../../src/config/container', () => ({
  container: {
    get: jest.fn(),
  },
}));

const mockUserService = {
  getUserById: jest.fn(),
  getUserDetails: jest.fn(),
};

const mockRoleService = {
  getRoleById: jest.fn(),
};

describe('authenticateToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (container.get as jest.Mock).mockImplementation((token: unknown) => {
      if (token === TYPES.IUserService) return mockUserService;
      if (token === TYPES.IRoleService) return mockRoleService;
    });
    config.jwtSecret = 'test-secret';
  });

  it('should throw if token is missing', async () => {
    const req = {
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as import('express').Request;

    await expect(authenticateToken(req)).rejects.toThrow(
      new AppError('Invalid token payload', 401)
    );
  });

  it('should throw if jwtSecret is missing', async () => {
    const req = {
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as import('express').Request;
    config.jwtSecret = '';

    await expect(authenticateToken(req)).rejects.toThrow(
      new AppError('SECRET_JWT is not defined in the environment variables', 500)
    );
  });

  it('should return user and role on valid token', async () => {
    const req = {
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as import('express').Request;

    const mockUserDetails = {
      id: fakeUser.id,
      name: fakeUser.fullName,
      email: fakeUser.email,
      cooperativeId: fakeUser.cooperativeId,
      districtId: fakeUser.districtId,
      roles: [],
      bidRoles: [],
      manageBids: [],
      status: fakeUser.userStatus.name,
      lastLogin: fakeUser.lastLogin || new Date(),
      demoAccount: fakeUser.demoAccount,
      firstName: fakeUser.firstName,
      lastName: fakeUser.lastName
    };

    (jwt.verify as jest.Mock).mockReturnValue({ id: 123 });
    mockUserService.getUserDetails.mockResolvedValue(mockUserDetails);

    const result = await authenticateToken(req);

    expect(result.user).toEqual(mockUserDetails);
  });

  it('should return nulls if token is invalid', async () => {
    const req = {
      headers: { authorization: 'Bearer valid-token' },
    } as unknown as import('express').Request;

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    const result = await authenticateToken(req);

    expect(result).toEqual({ user: null });
  });
});
