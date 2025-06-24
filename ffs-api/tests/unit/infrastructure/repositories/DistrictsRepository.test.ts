import { DistrictRepository } from '../../../../src/infrastructure/repositories/DistrictsRepository';
import { District } from '../../../../src/domain/interfaces/Districts/District';

describe('DistrictRepository', () => {
  let repository: DistrictRepository;
  let mockDatabaseService: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      district: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    mockDatabaseService = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      getClient: jest.fn().mockReturnValue(mockPrisma),
      runInTransaction: jest.fn(),
    };

    repository = new DistrictRepository(mockDatabaseService);
    jest.clearAllMocks();
  });

  describe('createWithTransaction', () => {
    it('should create district with transaction successfully', async () => {
      const district = District.create({
        name: 'Test District',
        location: 'Test Location',
        directorName: 'John Director',
        addressLine1: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        phone: '555-0123',
        email: 'test@district.edu',
      }, 1, 1, 'DIST-001');

      const mockCreatedDistrict = {
        id: 1,
        name: 'Test District',
        location: 'Test Location',
        directorName: 'John Director',
        streetAddress1: '123 Main St',
        streetAddress2: null,
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        phone: '555-0123',
        email: 'test@district.edu',
        fax: null,
        website: null,
        districtEnrollment: null,
        raNumber: null,
        numberOfSchools: null,
        numberOfStudents: null,
        annualBudget: null,
        superintendentName: null,
        establishedYear: null,
        statusId: 1,
        cooperativeId: 1,
        code: 'DIST-001',
        participatingIn: null,
        shippingAddress: null,
        description: null,
        notes: null,
        createdAt: new Date(),
        isDeleted: false,
      };

      const mockPrismaTransaction = {
        district: {
          create: jest.fn().mockResolvedValue(mockCreatedDistrict)
        }
      };

      const result = await repository.createWithTransaction(mockPrismaTransaction as any, district);

      expect(result).toBeInstanceOf(District);
      expect(result.name).toBe('Test District');
      expect(mockPrismaTransaction.district.create).toHaveBeenCalledWith({
        data: {
          name: 'Test District',
          location: 'Test Location',
          directorName: 'John Director',
          streetAddress1: '123 Main St',
          streetAddress2: null,
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          phone: '555-0123',
          email: 'test@district.edu',
          fax: null,
          website: null,
          districtEnrollment: null,
          raNumber: null,
          numberOfSchools: null,
          numberOfStudents: null,
          annualBudget: null,
          superintendentName: null,
          establishedYear: null,
          statusId: 1,
          cooperativeId: 1,
          code: 'DIST-001',
          participatingIn: null,
          shippingAddress: null,
          description: null,
          notes: null,
        },
        select: {
          id: true,
          name: true,
          location: true,
          directorName: true,
          streetAddress1: true,
          streetAddress2: true,
          city: true,
          state: true,
          zipCode: true,
          phone: true,
          email: true,
          fax: true,
          website: true,
          districtEnrollment: true,
          raNumber: true,
          numberOfSchools: true,
          numberOfStudents: true,
          annualBudget: true,
          superintendentName: true,
          establishedYear: true,
          statusId: true,
          cooperativeId: true,
          code: true,
          participatingIn: true,
          shippingAddress: true,
          description: true,
          notes: true,
          isDeleted: true,
        },
      });
    });

    it('should handle unique constraint error in transaction', async () => {
      const district = District.create({
        name: 'Test District',
        location: 'Test Location',
        directorName: 'John Director',
        addressLine1: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        phone: '555-0123',
        email: 'test@district.edu',
      }, 1, 1, 'DIST-001');

      const uniqueConstraintError = new Error('Unique constraint failed');
      (uniqueConstraintError as any).code = 'P2002';

      const mockPrismaTransaction = {
        district: {
          create: jest.fn().mockRejectedValue(uniqueConstraintError)
        }
      };

      await expect(repository.createWithTransaction(mockPrismaTransaction as any, district))
        .rejects.toThrow('A district with this code already exists');
    });

    it('should handle general transaction errors', async () => {
      const district = District.create({
        name: 'Test District',
        location: 'Test Location',
        directorName: 'John Director',
        addressLine1: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        phone: '555-0123',
        email: 'test@district.edu',
      }, 1, 1, 'DIST-001');

      const generalError = new Error('Database connection failed');

      const mockPrismaTransaction = {
        district: {
          create: jest.fn().mockRejectedValue(generalError)
        }
      };

      await expect(repository.createWithTransaction(mockPrismaTransaction as any, district))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('create', () => {
    it('should create district successfully', async () => {
      const district = District.create({
        name: 'Test District',
        location: 'Test Location',
        directorName: 'John Director',
        addressLine1: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        phone: '555-0123',
        email: 'test@district.edu',
      }, 1, 1, 'DIST-001');

      const mockCreatedDistrict = {
        id: 1,
        name: 'Test District',
        location: 'Test Location',
        directorName: 'John Director',
        streetAddress1: '123 Main St',
        streetAddress2: null,
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        phone: '555-0123',
        email: 'test@district.edu',
        fax: null,
        website: null,
        districtEnrollment: null,
        raNumber: null,
        numberOfSchools: null,
        numberOfStudents: null,
        annualBudget: null,
        superintendentName: null,
        establishedYear: null,
        statusId: 1,
        cooperativeId: 1,
        code: 'DIST-001',
        participatingIn: null,
        shippingAddress: null,
        description: null,
        notes: null,
        createdAt: new Date(),
        isDeleted: false,
      };

      mockPrisma.district.create.mockResolvedValue(mockCreatedDistrict);

      const result = await repository.create(district);

      expect(result).toBeInstanceOf(District);
      expect(result.name).toBe('Test District');
      expect(mockPrisma.district.create).toHaveBeenCalled();
    });

    it('should handle unique constraint error', async () => {
      const district = District.create({
        name: 'Test District',
        location: 'Test Location',
        directorName: 'John Director',
        addressLine1: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        phone: '555-0123',
        email: 'test@district.edu',
      }, 1, 1, 'DIST-001');

      const uniqueConstraintError = new Error('Unique constraint failed');
      (uniqueConstraintError as any).code = 'P2002';

      mockPrisma.district.create.mockRejectedValue(uniqueConstraintError);

      await expect(repository.create(district))
        .rejects.toThrow('A district with this code already exists');
    });

    it('should handle general errors', async () => {
      const district = District.create({
        name: 'Test District',
        location: 'Test Location',
        directorName: 'John Director',
        addressLine1: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        phone: '555-0123',
        email: 'test@district.edu',
      }, 1, 1, 'DIST-001');

      const generalError = new Error('Database connection failed');

      mockPrisma.district.create.mockRejectedValue(generalError);

      await expect(repository.create(district))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('findByCooperativeId', () => {
    it('should find districts by cooperative ID', async () => {
      const cooperativeId = 1;
      const mockDistricts = [
        {
          id: 1,
          name: 'Test District 1',
          location: 'Test Location 1',
          directorName: 'John Director',
          streetAddress1: '123 Main St',
          streetAddress2: null,
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          phone: '555-0123',
          email: 'test1@district.edu',
          fax: null,
          website: null,
          districtEnrollment: null,
          raNumber: null,
          numberOfSchools: null,
          numberOfStudents: null,
          annualBudget: null,
          superintendentName: null,
          establishedYear: null,
          statusId: 1,
          cooperativeId: 1,
          code: 'DIST-001',
          participatingIn: null,
          shippingAddress: null,
          description: null,
          notes: null,
          createdAt: new Date(),
          isDeleted: false,
        },
      ];

      mockPrisma.district.findMany.mockResolvedValue(mockDistricts);

      const result = await repository.findByCooperativeId(cooperativeId);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(District);
      expect(mockPrisma.district.findMany).toHaveBeenCalledWith({
        where: { cooperativeId, isDeleted: false },
        include: {
          userStatus: true,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should find all districts', async () => {
      const mockDistricts = [
        {
          id: 1,
          name: 'Test District 1',
          location: 'Test Location 1',
          directorName: 'John Director',
          streetAddress1: '123 Main St',
          streetAddress2: null,
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          phone: '555-0123',
          email: 'test1@district.edu',
          fax: null,
          website: null,
          districtEnrollment: null,
          raNumber: null,
          numberOfSchools: null,
          numberOfStudents: null,
          annualBudget: null,
          superintendentName: null,
          establishedYear: null,
          statusId: 1,
          cooperativeId: 1,
          code: 'DIST-001',
          participatingIn: null,
          shippingAddress: null,
          description: null,
          notes: null,
          createdAt: new Date(),
          isDeleted: false,
        },
      ];

      mockPrisma.district.findMany.mockResolvedValue(mockDistricts);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(District);
      expect(mockPrisma.district.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
        include: {
          userStatus: true,
        },
      });
    });
  });

  describe('countByCooperativeId', () => {
    it('should count districts by cooperative ID', async () => {
      const cooperativeId = 1;
      const expectedCount = 5;

      mockPrisma.district.count.mockResolvedValue(expectedCount);

      const result = await repository.countByCooperativeId(cooperativeId);

      expect(result).toBe(expectedCount);
      expect(mockPrisma.district.count).toHaveBeenCalledWith({
        where: { cooperativeId, isDeleted: false },
      });
    });
  });
});
