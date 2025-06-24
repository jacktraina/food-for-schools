import { inject, injectable } from 'inversify';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';
import TYPES from '../../shared/dependencyInjection/types';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '../../domain/interfaces/userRoles/UserRole';
import { IUserRoleRepository } from '../../domain/interfaces/userRoles/IUserRoleRepository';
import { Role } from '../../domain/interfaces/roles/Role';
import { Scope } from '../../domain/interfaces/scopes/Scope';
import { ScopeType } from '../../domain/interfaces/scopeTypes/ScopeType';

@injectable()
export class UserRoleRepository implements IUserRoleRepository {
  private userRoleModel: PrismaClient['userRole'];
  private prisma: PrismaClient;

  constructor(@inject(TYPES.IDatabaseService) database: IDatabaseService) {
    this.prisma = database.getClient();
    this.userRoleModel = this.prisma.userRole;
  }

  async create(data: {
    userId: number;
    roleId: number;
    scopeId: number;
  }): Promise<UserRole> {
    const createdData = await this.userRoleModel.create({
      data: {
        userId: data.userId,
        roleId: data.roleId,
        scopeId: data.scopeId,
      },
      include: {
        role: {
          include: {
            roleCategory: true,
          }
        },
        scope: {
          include: {
            scopeType: true,
          }
        }
      },
    });

    return new UserRole({
      id: createdData.id,
      userId: createdData.userId,
      roleId: createdData.roleId,
      scopeId: createdData.scopeId,
      role: new Role({
        id: createdData.role.id,
        name: createdData.role.name,
        categoryId: createdData.role.categoryId,
        roleCategory: createdData.role.roleCategory,
      }),
      scope: new Scope({
        id: createdData.scope.id,
        typeId: createdData.scope.typeId,
        name: createdData.scope.name,
        scopeType: new ScopeType({
          id: createdData.scope.scopeType.id,
          name: createdData.scope.scopeType.name,
        })
      })
    });
  }

  async createWithTransaction(
    prisma: PrismaClient,
    data: {
      userId: number;
      roleId: number;
      scopeId: number;
    }
  ): Promise<UserRole> {
    const createdData = await prisma.userRole.create({
      data: {
        userId: data.userId,
        roleId: data.roleId,
        scopeId: data.scopeId,
      },
      include: {
        role: {
          include: {
            roleCategory: true,
          }
        },
        scope: {
          include: {
            scopeType: true,
          }
        }
      },
    });

    return new UserRole({
      id: createdData.id,
      userId: createdData.userId,
      roleId: createdData.roleId,
      scopeId: createdData.scopeId,
      role: new Role({
        id: createdData.role.id,
        name: createdData.role.name,
        categoryId: createdData.role.categoryId,
        roleCategory: createdData.role.roleCategory,
      }),
      scope: new Scope({
        id: createdData.scope.id,
        typeId: createdData.scope.typeId,
        name: createdData.scope.name,
        scopeType: new ScopeType({
          id: createdData.scope.scopeType.id,
          name: createdData.scope.scopeType.name,
        })
      })
    });
  }
}
