import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { PrismaClient } from '@prisma/client';
import { District } from '../../../../src/domain/interfaces/Districts/District';
import { DistrictRepository } from '../../../../src/infrastructure/repositories/DistrictsRepository';

jest.mock('@prisma/client');

describe('DistrictRepository', () => {
  let districtRepository: DistrictRepository;

  const mockDistrictModel = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
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
    code: 'DIST-001',
    participatingIn: 'Test Program',
    shippingAddress: '123 Main St',
    description: 'Test District Description',
    notes: 'Test notes',
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
        annualBudget: sampleDistrictData.annualBudget,
      });

      const district = new District(sampleDistrictData);
      const result = await districtRepository.create(district);

      expect(mockDistrictModel.create).toHaveBeenCalledWith({
        data: {
          ...sampleDistrictData,
          annualBudget: expect.any(Object), // Decimal object
        },
        select: expect.any(Object),
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
      await expect(
        districtRepository.create(district)
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return an array of District instances', async () => {
      const districtData = [
        {
          id: 1,
          name: 'District One',
          location: 'Location 1',
          directorName: 'Director 1',
          streetAddress1: '123 St',
          streetAddress2: null,
          city: 'City 1',
          state: 'ST',
          zipCode: '12345',
          phone: '1234567890',
          email: 'test1@example.com',
          fax: null,
          website: null,
          districtEnrollment: 1000,
          raNumber: 'RA-001',
          numberOfSchools: 5,
          numberOfStudents: 500,
          annualBudget: 500000,
          superintendentName: 'Super 1',
          establishedYear: 2000,
          statusId: 1,
          cooperativeId: 1,
          code: 'DIST-001',
          participatingIn: 'Program 1',
          shippingAddress: '123 Ship St',
          description: 'Description 1',
          notes: 'Notes 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          userStatus: {
            id: 1,
            name: 'Active'
          },
        },
      ];

      mockDistrictModel.findMany.mockResolvedValue(districtData);

      const result = await districtRepository.findAll();

      expect(mockDistrictModel.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
        },
        include: {
          userStatus: true,
        },
      });

      expect(result).toHaveLength(1);
      result.forEach((district) => {
        expect(district).toBeInstanceOf(District);
      });

      expect(result[0].annualBudget).toBe(500000);
      expect(result[0].isDeleted).toBe(false);
    });

    it('should return an empty array if no districts found', async () => {
      mockDistrictModel.findMany.mockResolvedValue([]);

      const result = await districtRepository.findAll();

      expect(result).toEqual([]);
      expect(mockDistrictModel.findMany).toHaveBeenCalled();
    });
  });

  describe('findByIds', () => {
    const mockDistrictId = 1;
    const mockOrganizationId = 10;
    const now = new Date();

    const mockDistrictData = {
      id: mockDistrictId,
      cooperativeId: mockOrganizationId,
      statusId: 1,
      name: 'Test District',
      location: 'Testville',
      directorName: 'Jane Doe',
      streetAddress1: '123 Main St',
      streetAddress2: 'Apt 4B',
      city: 'Test City',
      state: 'TS',
      zipCode: '99999',
      phone: '123-456-7890',
      email: 'test@district.edu',
      fax: '123-456-7891',
      website: 'https://testdistrict.edu',
      districtEnrollment: 1000,
      raNumber: 'RA-001',
      numberOfSchools: 5,
      numberOfStudents: 900,
      annualBudget: { toNumber: () => 1000000 },
      secondaryContactName: 'John Smith',
      secondaryContactPhone: '123-456-7892',
      secondaryContactEmail: 'john.smith@district.edu',
      superintendentName: 'Dr. Brown',
      establishedYear: 2000,
      billingContactName: 'Alice Johnson',
      billingContactStreetAddress1: '456 Oak St',
      billingContactStreetAddress2: 'Suite 100',
      billingContactCity: 'Billing City',
      billingContactState: 'TS',
      billingContactZipCode: '99998',
      billingContactPhone: '321-654-0987',
      billingContactEmail: 'billing@district.edu',
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      userStatus: {
        id: 1,
        name: 'Active'
      },
    };

    it('should return a District instance when found', async () => {
      mockDistrictModel.findFirst.mockResolvedValue(mockDistrictData);

      const result = await districtRepository.findByIds(mockDistrictId);

      expect(mockDistrictModel.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockDistrictId,
          isDeleted: false,
        },
        include: {
          userStatus: true,
        },
      });

      expect(result).toBeInstanceOf(District);
      expect(result).toMatchObject({
        id: mockDistrictId,
        name: 'Test District',
        annualBudget: 1000000,
        isDeleted: false,
      });
    });

    it('should return null if no district is found', async () => {
      mockDistrictModel.findFirst.mockResolvedValue(null);

      const result = await districtRepository.findByIds(mockDistrictId);

      expect(result).toBeNull();
    });

    it('should throw an error if the DB call fails', async () => {
      mockDistrictModel.findFirst.mockRejectedValue(new Error('Database error'));

      await expect(
        districtRepository.findByIds(mockDistrictId)
      ).rejects.toThrow('Database error');
    });
  });
  
  describe('update', () => {
    const mockDistrictId = 202;
  
    beforeEach(() => {
      mockDistrictModel.update.mockReset();
    });
  
    it('should call districtModel.update with District entity using mapper', async () => {
      const district = new District({
        id: mockDistrictId,
        name: 'Updated Name',
        phone: '123-123-1234',
        city: 'New City',
        statusId: 1,
      });
  
      await districtRepository.update(district);
  
      expect(mockDistrictModel.update).toHaveBeenCalledWith({
        where: { id: mockDistrictId },
        data: expect.objectContaining({
          name: 'Updated Name',
          phone: '123-123-1234',
          city: 'New City',
          userStatus: {
            connect: {
              id: 1
            }
          }
        }),
      });
    });

    it('should throw an error if update fails', async () => {
      const district = new District({
        id: mockDistrictId,
        name: 'Test District',
        statusId: 1,
      });

      mockDistrictModel.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        districtRepository.update(district)
      ).rejects.toThrow('Update failed');
    });
  })
});
