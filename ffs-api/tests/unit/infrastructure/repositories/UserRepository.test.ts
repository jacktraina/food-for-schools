import { PrismaClient } from "@prisma/client";
import { IDatabaseService } from "../../../../src/application/contracts/IDatabaseService";
import { Role } from "../../../../src/domain/interfaces/roles/Role";
import { Scope } from "../../../../src/domain/interfaces/scopes/Scope";
import { ScopeType } from "../../../../src/domain/interfaces/scopeTypes/ScopeType";
import { UserRole } from "../../../../src/domain/interfaces/userRoles/UserRole";
import { User } from "../../../../src/domain/interfaces/users/User";
import { UserManagedBid } from "../../../../src/domain/interfaces/UserManagedBids/UserManagedBid";
import { UserRepository } from "../../../../src/infrastructure/repositories/UserRepository";
import { fakeUser, mockInactiveStatus, mockUser } from "../../../mocks/mockUser";
jest.mock('@prisma/client');

// Create a deep mock of the Prisma client
const mockUserModel = {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  };

  const mockPrismaClient = {
    user: mockUserModel,
  };


const mockDatabaseService: jest.Mocked<IDatabaseService> = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    getClient: jest.fn().mockReturnValue(mockPrismaClient as unknown as PrismaClient),
    runInTransaction: jest.fn(),
  };

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository(mockDatabaseService);
  });

  describe('findById', () => {
    it('should return a User when user exists', async () => {
      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        userStatus: { id: 1, name: 'Active' },
        lastLogin: new Date(),
        demoAccount: false,
        districtId: 1,
        isDeleted: false,
        emailVerified: true,
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUserData);

      const result = await userRepository.findById(1);

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(1);
      expect(result?.email).toBe('test@example.com');
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { userStatus: true },
      });
    });

    it('should return null when user does not exist', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findById(999);

      expect(result).toBeNull();
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: { userStatus: true },
      });
    });

    it('should handle database errors', async () => {
      mockPrismaClient.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findById(1)).rejects.toThrow('Database error');
    });
  });

  describe('findByEmail', () => {
    it('should return a User when email exists', async () => {
      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        userStatus: { id: 1, name: 'Active' },
        lastLogin: new Date(),
        demoAccount: false,
        districtId: 1,
        isDeleted: false,
        emailVerified: true,
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUserData);

      const result = await userRepository.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('test@example.com');
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { userStatus: true },
      });
    });

    it('should return null when email does not exist', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockPrismaClient.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findByEmail('test@example.com')).rejects.toThrow('Database error');
    });
  });

  describe('getUserDetails', () => {
    const mockUserData = {
      id: 1,
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      userStatus: { id: 1, name: 'Active' },
      lastLogin: new Date(),
      demoAccount: false,
      cooperativeId: 1,
      isDeleted: false,
      emailVerified: true,
      userRoles: [
        {
          id: 1,
          userId: 1,
          roleId: 1,
          scopeId: 1,
          role: {
            id: 1,
            name: 'Admin',
            categoryId: 1,
            rolePermissions: [
              {
                permission: {
                  id: 1,
                  name: 'create_user',
                },
              },
            ],
            roleCategory: {
              id: 1,
              name: 'Admin',
            },
          },
          scope: {
            id: 1,
            typeId: 1,
            name: 'Global',
            scopeType: {
              id: 1,
              name: 'Organization',
            },
          },
        },
      ],
      userManagedBids: [
        {
          bid: {
            id: 1,
            code: 'BID-001',
            name: 'Test Bid', // Added to match select clause
            bidYear: 2023,   // Added to match select clause
            status: 'In Process', // Added to match select clause
          },
        },
      ],
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return detailed user information with roles and bids', async () => {
      mockUserModel.findUnique.mockResolvedValue(mockUserData);
  
      const result = await userRepository.getUserDetails(1);
  
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(1);
      expect(result?.email).toBe('test@example.com');
  
      // Verify roles
      expect(result?.userRoles.length).toBe(1);
      const userRole = result?.userRoles[0];
      expect(userRole).toBeInstanceOf(UserRole);
      expect(userRole?.role).toBeInstanceOf(Role);
      expect(userRole?.role?.name).toBe('Admin');
      expect(userRole?.scope).toBeInstanceOf(Scope);
      expect(userRole?.scope?.scopeType).toBeInstanceOf(ScopeType);
  
      // Verify bids
      expect(result?.managedBids.length).toBe(1);
      const bid = result?.managedBids[0];
      expect(bid).toBeInstanceOf(UserManagedBid);
      expect(bid?.bid?.code).toBe('BID-001');
  
      expect(mockUserModel.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          userStatus: true,
          userRoles: {
            include: {
              role: {
                include: {
                  roleCategory: true,
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
              scope: {
                include: {
                  scopeType: true,
                },
              },
            },
          },
          userManagedBids: {
            include: {
              bid: {
                select: {
                  id: true,
                  name: true,
                  bidYear: true,
                  status: true,
                },
              },
            },
          },
        },
      });
    });

    it('should return null when user does not exist', async () => {
      mockUserModel.findUnique.mockResolvedValue(null);

      const result = await userRepository.getUserDetails(999);

      expect(result).toBeNull();
    });

    it('should handle empty roles and bids', async () => {
      const userDataWithoutRelations = {
        ...mockUserData,
        userRoles: [],
        userManagedBids: [],
      };
      mockUserModel.findUnique.mockResolvedValue(userDataWithoutRelations);

      const result = await userRepository.getUserDetails(1);

      expect(result).toBeInstanceOf(User);
      expect(result?.userRoles.length).toBe(0);
      expect(result?.managedBids.length).toBe(0);
    });

    it('should handle database errors', async () => {
      mockUserModel.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.getUserDetails(1)).rejects.toThrow('Database error');
    });
  });

  describe('constructor', () => {
    it('should initialize with database service', () => {
      // Create a fresh instance to test constructor
      const newMockDatabaseService: jest.Mocked<IDatabaseService> = {
        connect: jest.fn(),
        disconnect: jest.fn(),
        getClient: jest.fn().mockReturnValue(mockPrismaClient as unknown as PrismaClient),
        runInTransaction: jest.fn(),
      };
      const repo = new UserRepository(newMockDatabaseService);
      
      expect(repo).toBeInstanceOf(UserRepository);
      expect(newMockDatabaseService.getClient).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    // Use the mock user data from your shared mocks
    let mockUserData: User;
    let updatedUserData: User;

    beforeEach(() => {
      // Reset to original mock user data before each test
      mockUserData = mockUser;
      updatedUserData = {
        ...mockUserData,
        email: 'updated.user@example.com',
        firstName: 'Updated',
        lastName: 'User',
        userStatus: mockInactiveStatus,
        lastLogin: new Date('2025-05-08T12:00:00Z'),
        demoAccount: true,
        districtId: 20,
        isDeleted: true,
        emailVerified: false,
      } as User;

      // Clear all mocks before each test
      jest.clearAllMocks();
    });

    it('should successfully update a user and return the updated User instance', async () => {
      // Mock the update operation to return updated data
      mockUserModel.update.mockResolvedValue({
        ...updatedUserData,
        userStatus: mockInactiveStatus,
        userRoles: mockUserData.userRoles, // Maintain same roles for this test
      });

      const userToUpdate = new User(updatedUserData);
      const result = await userRepository.update(userToUpdate);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(1);
      expect(result.email).toBe('updated.user@example.com');
      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('User');
      expect(result.userStatus.id).toBe(2); // Inactive status
      expect(result.demoAccount).toBe(true);
      expect(result.districtId).toBe(20);
      expect(result.isDeleted).toBe(true);
      expect(result.emailVerified).toBe(false);
      // Verify roles and bids are maintained
      expect(result.userRoles.length).toBe(2);
      expect(result.managedBids.length).toBe(1);

      // Verify the update was called with correct parameters
      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          email: 'updated.user@example.com',
          firstName: 'Updated',
          lastName: 'User',
          passwordHash: 'hasehd-pass',
          lastLogin: updatedUserData.lastLogin,
          demoAccount: true,
          isDeleted: true,
          emailVerified: false,
          statusId: 1,
          cooperativeId: null,
          districtId: 20,
        },
        include: {
          userStatus: true,
          
        },
      });
    });

    it('should handle partial updates correctly', async () => {
      const partialUpdateData = {
        ...fakeUser
      };

      const partiallyUpdatedUserData = {
        ...mockUserData,
        firstName: 'Partial',
        lastName: 'Update',
        userStatus: mockInactiveStatus,
      };

      mockUserModel.update.mockResolvedValue({
        ...partiallyUpdatedUserData,
        userRoles: mockUserData.userRoles,
      });

      const result = await userRepository.update(new User(partialUpdateData));

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(1);
      expect(result.firstName).toBe('Partial');
      expect(result.lastName).toBe('Update');
      expect(result.userStatus.id).toBe(2); // Inactive status
      // Other fields should remain unchanged from original mock
      expect(result.email).toBe('test.user@example.com');
      expect(result.districtId).toBe(10);
      expect(result.demoAccount).toBe(false);
      expect(result.isDeleted).toBe(false);
      expect(result.emailVerified).toBe(true);

      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          demoAccount: true,
          email: "demo.user@example.com",
          emailVerified: false,
          firstName: "Demo",
          isDeleted: false,
          lastLogin: null,
          lastName: "User",
          statusId: 1,
          cooperativeId: null,
          districtId: 10,
          passwordHash: "hasehd-pass",
        },
        include: {
          userStatus: true,
        },
      });
    });

    it('should throw an error when trying to update a non-existent user', async () => {
      mockUserModel.update.mockRejectedValue(
        new Error('Record to update not found')
      );

      const userToUpdate = new User({
        ...fakeUser,
        id: 999, // Non-existent ID
      });

      await expect(userRepository.update(userToUpdate)).rejects.toThrow(
        'Record to update not found'
      );
    });

    it('should handle database errors during update', async () => {
      mockUserModel.update.mockRejectedValue(new Error('Database connection error'));

      await expect(userRepository.update(mockUser)).rejects.toThrow(
        'Database connection error'
      );
    });

    it('should maintain existing values when optional fields are not provided', async () => {
      const minimalUpdateData = {
        ...fakeUser
      };

      const updatedDataWithDefaults = {
        ...mockUserData,
        firstName: 'MinimalUpdate',
      };

      mockUserModel.update.mockResolvedValue({
        ...updatedDataWithDefaults,
        userRoles: mockUserData.userRoles,
      });

      const result = await userRepository.update(new User(minimalUpdateData));

      expect(result).toBeInstanceOf(User);
      expect(result.firstName).toBe('MinimalUpdate');
      // Other fields should remain unchanged
      expect(result.lastName).toBe('User');
      expect(result.email).toBe('test.user@example.com');
      expect(result.userStatus.id).toBe(1); // Still active status

      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          demoAccount: true,
          email: "demo.user@example.com",
          emailVerified: false,
          firstName: "Demo",
          isDeleted: false,
          lastLogin: null,
          lastName: "User",
          statusId: 1,
          cooperativeId: null,
          districtId: 10,
          passwordHash: "hasehd-pass",
        },
        include: {
          userStatus: true,
        },
      });
    });

    it('should update a demo account user correctly', async () => {
      const demoUserUpdate = {
        ...fakeUser,
        firstName: 'UpdatedDemo',
        lastName: 'Account',
        demoAccount: false,
      };

      mockUserModel.update.mockResolvedValue({
        ...demoUserUpdate,
        userRoles: [],
      });

      const result = await userRepository.update(new User(demoUserUpdate));

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(2);
      expect(result.firstName).toBe('UpdatedDemo');
      expect(result.lastName).toBe('Account');
      expect(result.demoAccount).toBe(false);
      // Verify it's still the same email
      expect(result.email).toBe('demo.user@example.com');

      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          firstName: 'UpdatedDemo',
          lastName: 'Account',
          email: "demo.user@example.com",
          emailVerified: false,
          demoAccount: false,
          isDeleted: false,
          lastLogin: null,
          statusId: 1,
          cooperativeId: null,
          districtId: 10,
          passwordHash: "hasehd-pass",
        },
        include: {
          userStatus: true,
        },
      });
    });
  });
});
