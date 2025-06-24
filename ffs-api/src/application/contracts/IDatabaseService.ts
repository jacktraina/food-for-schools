import { PrismaClient } from '@prisma/client';

export interface IDatabaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getClient(): PrismaClient;
  runInTransaction<T>(fn: (tx: PrismaClient) => Promise<T | T[]>): Promise<T | T[]>;
}
