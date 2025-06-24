import { PrismaClient } from '@prisma/client';
import { IDatabaseService } from '../../../../src/application/contracts/IDatabaseService';
import { DatabaseService } from '../../../../src/infrastructure/services/DatabaseService';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('DatabaseService', () => {
  let databaseService: IDatabaseService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    databaseService = new DatabaseService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPrisma = (databaseService as any).prisma;
  });

  it('should connect to the database', async () => {
    await databaseService.connect();
    expect(mockPrisma.$connect).toHaveBeenCalledTimes(1);
  });

  it('should disconnect from the database', async () => {
    await databaseService.disconnect();
    expect(mockPrisma.$disconnect).toHaveBeenCalledTimes(1);
  });

  it('should return the Prisma client', () => {
    expect(databaseService.getClient()).toBe(mockPrisma);
  });
});
