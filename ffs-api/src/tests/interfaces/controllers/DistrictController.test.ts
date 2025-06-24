import { DistrictController } from '../../../../src/interfaces/controllers/DistrictController';
import { IDistrictService } from '../../../../src/application/contracts/IDistrictService';
import { Request, Response } from 'express';
import { CreateDistrictRequest } from '../../../../src/interfaces/requests/district/CreateDistrictRequest';
import { District } from '../../../domain/interfaces/Districts/District';

interface MockAuthRequest extends Partial<Request> {
  body: CreateDistrictRequest;
  user: {
    id: number;
    cooperativeId: number;
    userStatus: { id: number };
    userRoles: Array<{ role: { name: string } | null }>;
  };
}

describe('DistrictController - createDistrict', () => {
  let mockDistrictService: jest.Mocked<IDistrictService>;
  let districtController: DistrictController;
  let mockRequest: MockAuthRequest;
  let mockResponse: Partial<Response>;
  let createDistrictMethod: (req: Request, res: Response) => Promise<void>;

  beforeEach(() => {
    mockDistrictService = {
      createDistrict: jest.fn(),
    } as unknown as jest.Mocked<IDistrictService>;

    districtController = new DistrictController(mockDistrictService);
    // Manually extract the private method for isolated testing
    createDistrictMethod = (districtController as unknown as { createDistrict: (req: Request, res: Response) => Promise<void> })['createDistrict'];

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should create district and return 201 response when user is Group Admin', async () => {
    const mockDistrict = new District({
      id: 101,
      cooperativeId: 1,
      name: 'Test District',
      statusId: 1,
      createdAt: new Date(),
      isDeleted: false,
    });

    mockRequest = {
      body: {
        name: 'Test District',
      },
      user: {
        id: 1,
        cooperativeId: 1,
        userStatus: { id: 1 },
        userRoles: [{ role: { name: 'Group Admin' } }],
      },
    };

    mockDistrictService.createDistrict.mockResolvedValue(mockDistrict);

    await createDistrictMethod(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockDistrictService.createDistrict).toHaveBeenCalledWith(
      mockRequest.body,
      mockRequest.user.cooperativeId,
      mockRequest.user.userStatus.id
    );

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      id: mockDistrict.id,
      name: mockDistrict.name,
    });
  });

  it('should return 403 if user is not a Group Admin', async () => {
    mockRequest = {
      body: {
        name: 'Test District',
      },
      user: {
        id: 2,
        cooperativeId: 1,
        userStatus: { id: 1 },
        userRoles: [{ role: { name: 'Viewer' } }],
      },
    };

    await createDistrictMethod(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(mockDistrictService.createDistrict).not.toHaveBeenCalled();
  });
});
