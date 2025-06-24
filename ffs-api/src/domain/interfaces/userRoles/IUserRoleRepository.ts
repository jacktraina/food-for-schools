import { PrismaClient } from '@prisma/client';
import { UserRole } from './UserRole';

export interface IUserRoleRepository {
  create(data: {
    userId: number;
    roleId: number;
    scopeId: number;
  }): Promise<UserRole>;
  createWithTransaction(
    prisma: PrismaClient,
    data: {
      userId: number;
      roleId: number;
      scopeId: number;
    }
  ): Promise<UserRole>;
}
