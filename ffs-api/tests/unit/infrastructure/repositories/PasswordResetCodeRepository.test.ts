import { PasswordResetCodeRepository } from '../../../../src/infrastructure/repositories/PasswordResetCodeRepository';
import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { PrismaClient } from '@prisma/client';
import { PasswordResetCode } from '../../../../src/domain/interfaces/passwordResetCodes/PasswordResetCode';

describe('PasswordResetCodeRepository', () => {
  let passwordResetCodeRepository: PasswordResetCodeRepository;

  const mockPasRestCodesModel = {
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  };

  const mockPrisma = {
    passwordResetCode: mockPasRestCodesModel,
  };

  const mockDatabaseService: jest.Mocked<IDatabaseService> = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    getClient: jest.fn().mockReturnValue(mockPrisma as unknown as PrismaClient),
    runInTransaction: jest.fn(),
  };

  const mockCode = {
    id: 'reset-123',
    userId: 123,
    code: '123456',
    expiresAt: new Date(Date.now() + 10 * 60000),
    used: false,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    passwordResetCodeRepository = new PasswordResetCodeRepository(mockDatabaseService);
  });

  describe('findByUserIdAndCode', () => {
    it('should return a PasswordResetCode entity when found', async () => {
      mockPasRestCodesModel.findFirst.mockResolvedValue(mockCode);

      const result = await passwordResetCodeRepository.findByUserIdAndCode(
        123,
        '123456'
      );

      expect(mockPasRestCodesModel.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 123,
          code: '123456',
        },
      });

      expect(result).toBeInstanceOf(PasswordResetCode);
      expect(result?.code).toBe('123456');
      expect(result?.userId).toBe(123);
    });

    it('should return null if no code is found', async () => {
      mockPasRestCodesModel.findFirst.mockResolvedValue(null);

      const result = await passwordResetCodeRepository.findByUserIdAndCode(
        123,
        'notfound'
      );

      expect(result).toBeNull();
    });
  });

  describe('markAsUsed', () => {
    it('should call update with correct arguments', async () => {
      await passwordResetCodeRepository.markAsUsed(123);

      expect(mockPasRestCodesModel.update).toHaveBeenCalledWith({
        where: { id: 123 },
        data: { used: true },
      });
    });

    it('should throw if prisma update fails', async () => {
      mockPasRestCodesModel.update.mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        passwordResetCodeRepository.markAsUsed(123)
      ).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create and return a PasswordResetCode entity', async () => {
      const inputData = {
        userId: 123,
        code: '654321',
        expiresAt: new Date(Date.now() + 5 * 60000),
      } as PasswordResetCode;
  
      const createdMockData = {
        id: 'reset-456',
        userId: inputData.userId,
        code: inputData.code,
        expiresAt: inputData.expiresAt,
        used: false,
        createdAt: new Date(),
      };
  
      // Add mock for create
      mockPasRestCodesModel.create = jest.fn().mockResolvedValue(createdMockData);
  
      const result = await passwordResetCodeRepository.create(inputData);
  
      expect(mockPasRestCodesModel.create).toHaveBeenCalledWith({
        data: {
          code: inputData.code,
          expiresAt: inputData.expiresAt,
          createdAt: undefined,
          used: undefined,
          user: {
            connect: {
              id: inputData.userId,
            },
          },
        },
      });
  
      expect(result).toBeInstanceOf(PasswordResetCode);
      expect(result.code).toBe(inputData.code);
      expect(result.userId).toBe(inputData.userId);
    });
  });
  
});
