import { CooperativeRepository } from '../../../../src/infrastructure/repositories/CooperativeRepository';
import { Cooperative } from '../../../../src/domain/interfaces/Cooperatives/Cooperative';
import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';

describe('CooperativeRepository', () => {
  let repository: CooperativeRepository;
  let mockPrismaClient: any;
  let mockDatabaseService: jest.Mocked<IDatabaseService>;

  beforeEach(() => {
    mockPrismaClient = {
      cooperatives: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockDatabaseService = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      getClient: jest.fn().mockReturnValue(mockPrismaClient),
      runInTransaction: jest.fn(),
    } as unknown as jest.Mocked<IDatabaseService>;
    
    repository = new CooperativeRepository(mockDatabaseService);
  });

  describe('create', () => {
    it('should create a new cooperative', async () => {
      const mockCooperativeData = {
        id: 1,
        code: 'COOP001',
        name: 'Test Cooperative',
        organizationTypeId: 1,
        description: 'Test Description',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        phone: '555-0123',
        email: 'test@coop.edu',
        website: 'https://test.coop.edu',
        established: 2000,
        userStatusId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const cooperative = new Cooperative(mockCooperativeData);

      mockPrismaClient.cooperatives.create.mockResolvedValue({
        ...mockCooperativeData,
        organizationType: { id: 1, name: 'Cooperative' },
        userStatus: { id: 1, name: 'Active' },
      });

      const result = await repository.create(cooperative);

      expect(mockPrismaClient.cooperatives.create).toHaveBeenCalledWith({
        data: {
          code: cooperative.code,
          name: cooperative.name,
          organizationTypeId: cooperative.organizationTypeId,
          address: cooperative.address,
          city: cooperative.city,
          state: cooperative.state,
          zip: cooperative.zip,
          phone: cooperative.phone,
          fax: cooperative.fax,
          email: cooperative.email,
          website: cooperative.website,
          logo: cooperative.logo,
          description: cooperative.description,
          enrollment: cooperative.enrollment,
          location: cooperative.location,
          directorsName: cooperative.directorsName,
          raNumber: cooperative.raNumber,
          superintendent: cooperative.superintendent,
          established: cooperative.established,
          userStatusId: cooperative.userStatusId,
          budget: cooperative.budget,
          lastUpdated: cooperative.lastUpdated,
          participatingIn: cooperative.participatingIn,
          shippingAddress: cooperative.shippingAddress,
          notes: cooperative.notes,
        },
        include: {
          organizationType: true,
          userStatus: true,
        },
      });
      expect(result).toBeInstanceOf(Cooperative);
    });
  });

  describe('findAll', () => {
    it('should return all cooperatives', async () => {
      const mockCooperatives = [
        {
          id: 1,
          code: 'COOP001',
          name: 'Test Cooperative 1',
          organizationTypeId: 1,
          description: 'Test Description 1',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          phone: '555-0123',
          email: 'test1@coop.edu',
          website: 'https://test1.coop.edu',
          established: 2000,
          userStatusId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.cooperatives.findMany.mockResolvedValue(mockCooperatives.map(coop => ({
        ...coop,
        organizationType: { id: 1, name: 'Cooperative' },
        userStatus: { id: 1, name: 'Active' },
      })));

      const result = await repository.findAll();

      expect(mockPrismaClient.cooperatives.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Cooperative);
    });
  });

  describe('findById', () => {
    it('should return a cooperative when found', async () => {
      const mockCooperative = {
        id: 1,
        code: 'COOP001',
        name: 'Test Cooperative',
        organizationTypeId: 1,
        description: 'Test Description',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        phone: '555-0123',
        email: 'test@coop.edu',
        website: 'https://test.coop.edu',
        established: 2000,
        userStatusId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.cooperatives.findUnique.mockResolvedValue({
        ...mockCooperative,
        organizationType: { id: 1, name: 'Cooperative' },
        userStatus: { id: 1, name: 'Active' },
      });

      const result = await repository.findById(1);

      expect(mockPrismaClient.cooperatives.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        include: {
          organizationType: true,
          userStatus: true,
        },
      });
      expect(result).toBeInstanceOf(Cooperative);
    });

    it('should return null when cooperative not found', async () => {
      mockPrismaClient.cooperatives.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });
});
