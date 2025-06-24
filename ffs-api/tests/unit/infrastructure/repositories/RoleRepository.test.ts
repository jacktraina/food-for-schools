import { RoleRepository } from '../../../../src/infrastructure/repositories/RoleRepository';
import { Role } from '../../../../src/domain/interfaces/roles/Role';
import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';

describe('RoleRepository', () => {
  let repository: RoleRepository;
  let mockDatabaseService: any;
  let mockPrismaClient: any;

  beforeEach(() => {
    mockPrismaClient = {
      role: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockDatabaseService = {
      getClient: jest.fn().mockReturnValue(mockPrismaClient),
      connect: jest.fn(),
      disconnect: jest.fn(),
      runInTransaction: jest.fn(),
    };
    
    repository = new RoleRepository(mockDatabaseService);
  });

  describe('findById', () => {
    it('should return role when found', async () => {
      const mockRoleData = {
        id: 1,
        name: 'District Admin',
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      mockPrismaClient.role.findUnique.mockResolvedValue(mockRoleData);

      const result = await repository.findById(1);

      expect(mockPrismaClient.role.findUnique).toHaveBeenCalledWith({
        include: {
          roleCategory: true,
        },
        where: {
          id: 1,
        },
      });
      expect(result).toBeInstanceOf(Role);
    });

    it('should return null when role not found', async () => {
      mockPrismaClient.role.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });
});
