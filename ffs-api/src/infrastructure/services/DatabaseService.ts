import { PrismaClient } from '@prisma/client';
import { injectable } from 'inversify';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';

@injectable()
export class DatabaseService implements IDatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
    console.log('Connected to PostgreSQL successfully');
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  getClient(): PrismaClient {
    return this.prisma;
  }

  async runInTransaction<T>(fn: (tx: PrismaClient) => Promise<T | T[]>): Promise<T | T[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.prisma.$transaction(fn as any);
    return result;
  }

}
