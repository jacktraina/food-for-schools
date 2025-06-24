import { PrismaClient } from '@prisma/client';
import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { EmailVerificationCodeRepository } from '../../../../src/infrastructure/repositories/EmailVerificationCodeRepository';
import { EmailVerificationCode } from '../../../../src/domain/interfaces/emailVerificationCodes/EmailVerificationCode';

jest.mock('@prisma/client');

// Create a deep mock of the Prisma client
const mockEmailVerificationCodeModel = {
  create: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn(),
};

const mockPrismaClient = {
  emailVerificationCode: mockEmailVerificationCodeModel,
} as unknown as PrismaClient;

const mockDatabaseService: jest.Mocked<IDatabaseService> = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  getClient: jest.fn().mockReturnValue(mockPrismaClient),
  runInTransaction: jest.fn(),
};

describe('EmailVerificationCodeRepository', () => {
  let repository: EmailVerificationCodeRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new EmailVerificationCodeRepository(mockDatabaseService);
  });

  describe('create', () => {
    it('should create an email verification code', async () => {
      const now = new Date(); 
      // Arrange
      const mockEntity = new EmailVerificationCode({
        id: -1,
        userId: 1,
        code: '123456',
        expiresAt: now,
        used: false,
        createdAt: now,
        isDeleted: false,
      });
      const mockCreatedData = {
        id: 1,
        userId: 1,
        code: '123456',
        expiresAt: now,
        used: false,
        createdAt: now,
        isDeleted: false,
      };
      mockEmailVerificationCodeModel.create.mockResolvedValue(mockCreatedData);

      // Act
      const result = await repository.create(mockEntity);

      // Assert
      expect(mockEmailVerificationCodeModel.create).toHaveBeenCalledWith({
        data: {
          user: {
            connect: {
              id: 1,
            },
          },
          code: '123456',
          expiresAt: mockEntity.expiresAt,
          used: false,
          createdAt: expect.any(Date),
          isDeleted: false,
        },
      });
      expect(result).toBeInstanceOf(EmailVerificationCode);
      expect(result.id).toBe(1);
      expect(result.userId).toBe(1);
      expect(result.code).toBe('123456');
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      const mockEntity = new EmailVerificationCode({
          id: -1,
        userId: 1,
        code: '123456',
        expiresAt: new Date(),
        used: false,
        createdAt: new Date(),
        isDeleted: false,
      });
      mockEmailVerificationCodeModel.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(repository.create(mockEntity)).rejects.toThrow('Database error');
    });
  });

  describe('findByUserIdAndCode', () => {
    it('should return an EmailVerificationCode if found', async () => {
      // Arrange
      const mockFoundData = {
        id: 2,
        userId: 1,
        code: 'abcdef',
        expiresAt: new Date(),
        used: false,
        createdAt: new Date(),
        isDeleted: false,
      };
      mockEmailVerificationCodeModel.findFirst.mockResolvedValue(mockFoundData);

      // Act
      const result = await repository.findByUserIdAndCode(1, 'abcdef');

      // Assert
      expect(mockEmailVerificationCodeModel.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 1,
          code: 'abcdef',
        },
      });
      expect(result).toBeInstanceOf(EmailVerificationCode);
      expect(result?.id).toBe(2);
      expect(result?.userId).toBe(1);
      expect(result?.code).toBe('abcdef');
    });

    it('should return null if no EmailVerificationCode is found', async () => {
      // Arrange
      mockEmailVerificationCodeModel.findFirst.mockResolvedValue(null);

      // Act
      const result = await repository.findByUserIdAndCode(1, 'nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should handle database errors during find', async () => {
      // Arrange
      mockEmailVerificationCodeModel.findFirst.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(repository.findByUserIdAndCode(1, 'test')).rejects.toThrow('Database error');
    });
  });

  describe('markAsUsed', () => {
    it('should update the used status of an email verification code', async () => {
      // Arrange
      mockEmailVerificationCodeModel.update.mockResolvedValue({ id: 3, used: true });

      // Act
      await repository.markAsUsed(3);

      // Assert
      expect(mockEmailVerificationCodeModel.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { used: true },
      });
    });

    it('should handle database errors during update', async () => {
      // Arrange
      mockEmailVerificationCodeModel.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(repository.markAsUsed(4)).rejects.toThrow('Database error');
    });
  });

  describe('createWithTransaction', () => {
    it('should create an email verification code within a transaction', async () => {
      // Arrange
      const mockPrismaTransaction = {
        emailVerificationCode: {
          create: jest.fn().mockResolvedValue({
            id: 4,
            userId: 2,
            code: 'ghijkl',
            expiresAt: new Date(),
            used: false,
            createdAt: new Date(),
            isDeleted: false,
          }),
        },
      } as unknown as PrismaClient;
      const mockData = {
        userId: 2,
        code: 'ghijkl',
        expiresAt: new Date(),
      };

      // Act
      const result = await repository.createWithTransaction(mockPrismaTransaction, mockData);

      // Assert
      expect(mockPrismaTransaction.emailVerificationCode.create).toHaveBeenCalledWith({
        data: {
          userId: 2,
          code: 'ghijkl',
          expiresAt: mockData.expiresAt,
        },
      });
      expect(result).toBeInstanceOf(EmailVerificationCode);
      expect(result.id).toBe(4);
      expect(result.userId).toBe(2);
      expect(result.code).toBe('ghijkl');
    });

    it('should handle errors during transactional creation', async () => {
      // Arrange
      const mockPrismaTransaction = {
        emailVerificationCode: {
          create: jest.fn().mockRejectedValue(new Error('Transaction error')),
        },
      } as unknown as PrismaClient;
      const mockData = {
        userId: 2,
        code: 'ghijkl',
        expiresAt: new Date(),
      };

      // Act & Assert
      await expect(repository.createWithTransaction(mockPrismaTransaction, mockData)).rejects.toThrow(
        'Transaction error'
      );
    });
  });
});