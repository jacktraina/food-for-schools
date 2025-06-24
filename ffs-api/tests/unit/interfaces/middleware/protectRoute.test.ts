import { protectRoute } from '../../../../src/interfaces/middleware/protectRoute';
import { AppError } from '../../../../src/interfaces/middleware/errorHandler';
import { authenticateToken } from '../../../../src/shared/utils/authenticateToken';
import { Request, Response } from 'express';
import { fakeUser } from '../../../mocks/mockUser';

jest.mock('../../../../src/shared/utils/authenticateToken');

const mockAuthenticateToken = authenticateToken as jest.Mock;

describe('protectRoute middleware', () => {
  let req: Partial<Request>;
  const res = {} as Response;
  const next = jest.fn();

  beforeEach(() => {
    req = { headers: { authorization: 'Bearer token' } };
    jest.clearAllMocks();
  });

  it('should call next() and attach user and role if authenticated', async () => {
    mockAuthenticateToken.mockResolvedValue({
      user: fakeUser,
      role: 'Admin',
    });

    await protectRoute(req as Request, res, next);

    expect((req as any).user).toEqual(fakeUser);
    expect(next).toHaveBeenCalled();
  });

  it('should throw AppError if user is null', async () => {
    mockAuthenticateToken.mockResolvedValue({
      user: null,
      role: 'Admin',
    });

    await expect(protectRoute(req as Request, res, next)).rejects.toThrow(
      new AppError('Invalid authentication token or role missing.', 403)
    );
  });

  it('should throw AppError if authenticateToken returns null', async () => {
    mockAuthenticateToken.mockResolvedValue(null);

    await expect(protectRoute(req as Request, res, next)).rejects.toThrow(
      new AppError('Invalid authentication token or role missing.', 403)
    );
  });
});
