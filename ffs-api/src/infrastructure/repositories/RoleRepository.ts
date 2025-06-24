import { inject, injectable } from 'inversify';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';
import TYPES from '../../shared/dependencyInjection/types';
import { PrismaClient } from '@prisma/client';
import { Role } from '../../domain/interfaces/roles/Role';
import { IRoleRepository } from '../../domain/interfaces/roles/IRoleRepository';

@injectable()
export class RoleRepository implements IRoleRepository {
  private roleModel: PrismaClient['role'];

  constructor(@inject(TYPES.IDatabaseService) database: IDatabaseService) {
    const prismaClient = database.getClient();
    this.roleModel = prismaClient.role;
  }

  async findById(roleId: number): Promise<Role | null> {
    const role = await this.roleModel.findUnique({
      where: { id: roleId },
      include: {
        roleCategory: true,
      },
    });

    return role ? new Role({
      id: role.id,
      name: role.name,
      categoryId: role.categoryId,
      roleCategory: role.roleCategory,
    }) : null;
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.roleModel.findMany({
      include: {
        roleCategory: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return roles.map((role) => new Role({
      id: role.id,
      name: role.name,
      categoryId: role.categoryId,
      roleCategory: role.roleCategory,
    }));
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.roleModel.findFirst({
      where: { name },
      include: {
        roleCategory: true,
      },
    });

    return role ? new Role({
      id: role.id,
      name: role.name,
      categoryId: role.categoryId,
      roleCategory: role.roleCategory,
    }) : null;
  }
}
