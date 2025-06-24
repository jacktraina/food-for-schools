import { Cooperative } from './Cooperative';
import { PrismaClient } from '@prisma/client';

export interface ICooperativeRepository {
  create(cooperative: Cooperative): Promise<Cooperative>;
  createWithTransaction(prisma: PrismaClient, cooperative: Cooperative): Promise<Cooperative>;
  findById(id: number): Promise<Cooperative | null>;
  findByCode(code: string): Promise<Cooperative | null>;
  findAll(): Promise<Cooperative[]>;
  update(cooperative: Cooperative): Promise<Cooperative>;
  updateWithTransaction(prisma: PrismaClient, cooperative: Cooperative): Promise<Cooperative>;
  delete(id: number): Promise<boolean>;
}
