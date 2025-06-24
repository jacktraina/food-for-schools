import { SchoolController } from '../../../interfaces/controllers/SchoolController';
import { ISchoolService } from '../../../application/contracts/ISchoolService';
import { School } from '../../../domain/interfaces/Schools/School';
import { ForbiddenError } from '../../../domain/core/errors/ForbiddenError';
import { NotFoundError } from '../../../domain/core/errors/NotFoundError';
import { BadRequestError } from '../../../domain/core/errors/BadRequestError';
import { Request, Response } from 'express';

interface MockRequest extends Partial<Request> {
  params: {
    districtId: string;
    id: string;
  };
  body: Record<string, unknown>;
  user: {
    id: number;
  };
}

describe('SchoolController - updateSchool', () => {
  let schoolController: SchoolController;
  let mockSchoolService: jest.Mocked<ISchoolService>;
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let updateSchoolMethod: (req: Request, res: Response) => Promise<void>;

  beforeEach(() => {
    mockSchoolService = {
      createSchool: jest.fn(),
      getSchoolsByDistrictId: jest.fn(),
      getSchoolsDetailedByDistrictId: jest.fn(),
      updateSchool: jest.fn(),
      archiveSchool: jest.fn(),
      activateSchool: jest.fn(),
      deleteSchool: jest.fn(),
      getSchoolById: jest.fn(),
      getSchoolDetails: jest.fn(),
    } as jest.Mocked<ISchoolService>;

    schoolController = new SchoolController(mockSchoolService);
    updateSchoolMethod = (schoolController as unknown as { updateSchool: (req: Request, res: Response) => Promise<void> })['updateSchool'];

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  it('should return 200 when school is successfully updated', async () => {
    const districtId = 15;
    const schoolId = 10;
    const userId = 1;
    
    mockRequest = {
      params: { 
        districtId: districtId.toString(),
        id: schoolId.toString()
      },
      body: {
        name: 'Updated School Name',
        school_type: 'Middle School',
        override_district_billing: false
      },
      user: { id: userId },
    };

    const mockSchool = new School({
      id: schoolId,
      districtId: districtId,
      name: 'Updated School Name',
      schoolType: 'Middle School',
      overrideDistrictBilling: false,
      statusId: 1,
      isDeleted: false
    });

    mockSchoolService.updateSchool.mockResolvedValue(mockSchool);

    await updateSchoolMethod.call(schoolController, mockRequest as Request, mockResponse as Response);

    expect(mockSchoolService.updateSchool).toHaveBeenCalledWith(
      districtId,
      schoolId,
      {
        name: 'Updated School Name',
        schoolType: 'Middle School',
        addressLine1: undefined,
        addressLine2: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
        shippingAddressLine1: undefined,
        shippingAddressLine2: undefined,
        shippingAddressCity: undefined,
        shippingAddressState: undefined,
        shippingAddressZipCode: undefined,
        schoolContactName: undefined,
        schoolContactPhone: undefined,
        schoolContactEmail: undefined,
        notes: undefined,
        enrollment: undefined,
        overrideDistrictBilling: false
      },
      userId
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'School updated successfully' });
  });

  it('should return 400 when district ID is invalid', async () => {
    mockRequest = {
      params: { 
        districtId: 'invalid-id',
        id: '10'
      },
      body: {
        name: 'Updated School Name'
      },
      user: { id: 1 },
    };

    await updateSchoolMethod.call(schoolController, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid district ID' });
    expect(mockSchoolService.updateSchool).not.toHaveBeenCalled();
  });

  it('should return 400 when school ID is invalid', async () => {
    mockRequest = {
      params: { 
        districtId: '15',
        id: 'invalid-id'
      },
      body: {
        name: 'Updated School Name'
      },
      user: { id: 1 },
    };

    await updateSchoolMethod.call(schoolController, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid school ID' });
    expect(mockSchoolService.updateSchool).not.toHaveBeenCalled();
  });

  it('should return 403 when user does not have permission', async () => {
    mockRequest = {
      params: { 
        districtId: '15',
        id: '10'
      },
      body: {
        name: 'Updated School Name'
      },
      user: { id: 1 },
    };

    mockSchoolService.updateSchool.mockRejectedValue(new ForbiddenError('Not authorized'));

    await updateSchoolMethod.call(schoolController, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authorized' });
  });

  it('should return 404 when school or district is not found', async () => {
    mockRequest = {
      params: { 
        districtId: '15',
        id: '10'
      },
      body: {
        name: 'Updated School Name'
      },
      user: { id: 1 },
    };

    mockSchoolService.updateSchool.mockRejectedValue(new NotFoundError('School not found'));

    await updateSchoolMethod.call(schoolController, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'School not found' });
  });

  it('should return 400 when there is a bad request', async () => {
    mockRequest = {
      params: { 
        districtId: '15',
        id: '10'
      },
      body: {
        school_type: 'Invalid Type'
      },
      user: { id: 1 },
    };

    mockSchoolService.updateSchool.mockRejectedValue(new BadRequestError('Invalid school type'));

    await updateSchoolMethod.call(schoolController, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid school type' });
  });

  it('should handle unknown errors', async () => {
    mockRequest = {
      params: { 
        districtId: '15',
        id: '10'
      },
      body: {
        name: 'Updated School Name'
      },
      user: { id: 1 },
    };

    mockSchoolService.updateSchool.mockRejectedValue(new Error('Unknown error'));

    await updateSchoolMethod.call(schoolController, mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unknown error' });
  });
});
