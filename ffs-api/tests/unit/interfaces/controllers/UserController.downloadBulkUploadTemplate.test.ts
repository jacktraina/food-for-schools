import { UserController } from '../../../../src/interfaces/controllers/UserController';
import { IUserService } from '../../../../src/application/contracts/IUserService';
import { Request, Response } from 'express';
import { ForbiddenError } from '../../../../src/domain/core/errors/ForbiddenError';
import { AuthRequest } from '../../../../src/interfaces/responses/base/AuthRequest';

jest.mock('../../../../src/config/container', () => ({
  container: {
    get: jest.fn()
  }
}));

describe('UserController.downloadBulkUploadTemplate', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<IUserService>;
  let mockRequest: Partial<Request & AuthRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockUserService = {
      generateBulkUserTemplate: jest.fn(),
    } as unknown as jest.Mocked<IUserService>;

    userController = new UserController(mockUserService);

    mockRequest = {
      user: {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hash',
        firstName: 'Test',
        lastName: 'User',
        userStatus: { id: 1 } as any,
        demoAccount: false,
        districtId: 1,
        isDeleted: false,
        emailVerified: true,
        userRoles: [],
        managedBids: [],
        fullName: 'Test User',
        isActive: () => true,
        isEmailVerified: () => true,
        markEmailAsVerified: jest.fn(),
        checkPassword: jest.fn().mockResolvedValue(true),
        getAdminRoles: jest.fn().mockReturnValue([]),
        getBidRoles: jest.fn().mockReturnValue([]),
        updatePassword: jest.fn()
      } as any,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      send: jest.fn(),
    };
  });

  it('should throw ForbiddenError if user is not authenticated', async () => {
    mockRequest.user = undefined;

    const controller = userController as any;
    await expect(controller.downloadBulkUploadTemplate(mockRequest, mockResponse)).rejects.toThrow(
      new ForbiddenError('Authentication required')
    );
  });

  it('should return CSV template with correct headers', async () => {
    mockUserService.generateBulkUserTemplate.mockResolvedValue('email,full_name,role,bid_role,district_id,school_id\n');

    const controller = userController as any;
    await controller.downloadBulkUploadTemplate(mockRequest, mockResponse);

    expect(mockUserService.generateBulkUserTemplate).toHaveBeenCalledWith(1);
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=bulk_user_template.csv');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith('email,full_name,role,bid_role,district_id,school_id\n');
  });
});
