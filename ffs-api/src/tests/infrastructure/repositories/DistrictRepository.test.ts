import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { PrismaClient } from '@prisma/client';
import { District } from '../../../../src/domain/interfaces/Districts/District';
import { DistrictRepository } from '../../../infrastructure/repositories/DistrictsRepository';

jest.mock('@prisma/client');

describe('DistrictRepository', () => {
  let districtRepository: DistrictRepository;

  const mockDistrictModel = {
    create: jest.fn(),
  };

  const mockPrisma = {
    district: mockDistrictModel,
  };

  const mockDatabaseService: jest.Mocked<IDatabaseService> = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    runInTransaction: jest.fn(),
    getClient: jest.fn().mockReturnValue(mockPrisma as unknown as PrismaClient),
  };

  const now = new Date();
  const sampleDistrictData = {
    name: 'Test District',
    location: 'New York',
    directorName: 'John Doe',
    streetAddress1: '123 Main St',
    streetAddress2: null,
    city: 'NYC',
    state: 'NY',
    zipCode: '10001',
    phone: '1234567890',
    email: 'district@example.com',
    fax: null,
    website: null,
    statusId: 1,
    cooperativeId: 10,
    code: 'TEST-001',
    participatingIn: 'Test Program',
    shippingAddress: '123 Main St',
    description: null,
    notes: null,
    districtEnrollment: 5000,
    raNumber: 'RA-001',
    numberOfSchools: 10,
    numberOfStudents: 5000,
    annualBudget: 1000000,
    superintendentName: 'Superintendent X',
    establishedYear: 2001,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    districtRepository = new DistrictRepository(mockDatabaseService);
  });

  describe('create', () => {
    it('should create a district and return a District instance', async () => {
      mockDistrictModel.create.mockResolvedValue({
        id: 1,
        ...sampleDistrictData,
        createdAt: now,
        isDeleted: false,
        annualBudget: { toNumber: () => sampleDistrictData.annualBudget },
      });

      const district = new District(sampleDistrictData);
      const result = await districtRepository.create(district);

      expect(mockDistrictModel.create).toHaveBeenCalledWith({
        data: sampleDistrictData,
      });

      expect(result).toBeInstanceOf(District);
      expect(result).toMatchObject({
        id: 1,
        name: 'Test District',
        cooperativeId: 10,
        annualBudget: 1000000,
        isDeleted: false,
      });
    });

    it('should throw an error when creation fails', async () => {
      mockDistrictModel.create.mockRejectedValue(new Error('Database error'));

      const district = new District(sampleDistrictData);
      await expect(districtRepository.create(district)).rejects.toThrow('Database error');
    });
  });
});
