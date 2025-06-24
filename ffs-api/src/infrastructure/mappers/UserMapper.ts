import { Prisma } from "@prisma/client";
import { User } from "../../domain/interfaces/users/User";

import { UserRole } from "../../domain/interfaces/userRoles/UserRole";
import { UserStatus } from "../../domain/interfaces/userStatuses/UserStatus";
import { UserManagedBid } from "../../domain/interfaces/UserManagedBids/UserManagedBid";

export class UserMapper {
  /**
   * Maps domain object to Prisma create input (excludes auto-generated `id`)
   */
  static toPrisma(entity: User): Prisma.UserCreateInput {
    return {
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      passwordHash: entity.passwordHash,
      lastLogin: entity.lastLogin,
      demoAccount: entity.demoAccount,
      isDeleted: entity.isDeleted,
      emailVerified: entity.emailVerified,
      statusId: entity.statusId,
      cooperativeId: entity.cooperativeId,
      districtId: entity.districtId
    } as Prisma.UserCreateInput;
  }

  /**
   * Maps Prisma DB object to domain object
   */
  static toDomain(
    prismaModel: Prisma.UserGetPayload<{
      include: {
        userStatus: true;
        userRoles?: true;
        userManagedBids?: true;
        cooperative?: true;
        district?: true;
      };
    }>,

  ): User {
    // Map user roles if included
    const userRoles = prismaModel.userRoles?.map(userRole => 
      new UserRole({
        id: userRole.id,
        userId: userRole.userId,
        roleId: userRole.roleId,
        scopeId: userRole.scopeId
      })
    ) ?? [];

    // Map managed bids to UserManagedBid objects
    const managedBids = prismaModel.userManagedBids?.map(managedBid => 
      new UserManagedBid({
        userId: managedBid.userId,
        bidId: managedBid.bidId
      })
    ) ?? [];

    return new User({
      id: prismaModel.id,
      email: prismaModel.email,
      passwordHash: prismaModel.passwordHash,
      firstName: prismaModel.firstName,
      lastName: prismaModel.lastName,
      statusId: prismaModel.userStatus.id,
      userStatus: new UserStatus({
        id: prismaModel.userStatus.id,
        name: prismaModel.userStatus.name
      }),
      lastLogin: prismaModel.lastLogin ?? undefined,
      demoAccount: prismaModel.demoAccount,
      cooperativeId: (prismaModel as unknown as { cooperativeId?: number }).cooperativeId || null,
      districtId: (prismaModel as unknown as { districtId?: number }).districtId || null,
      isDeleted: prismaModel.isDeleted,
      emailVerified: prismaModel.emailVerified,
      userRoles,
      managedBids
    });
  }

  /**
   * Maps domain object to Prisma update input
   */
  static toPrismaUpdate(entity: Partial<User>): Prisma.UserUpdateInput {
    return {
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      passwordHash: entity.passwordHash,
      lastLogin: entity.lastLogin,
      demoAccount: entity.demoAccount,
      isDeleted: entity.isDeleted,
      emailVerified: entity.emailVerified,
      ...(entity.userStatus && {
        userStatus: {
          connect: {
            id: entity.userStatus.id
          }
        }
      }),

      ...(entity.cooperativeId && {
        cooperative: {
          connect: {
            id: entity.cooperativeId
          }
        }
      }),
      ...(entity.districtId && {
        district: {
          connect: {
            id: entity.districtId
          }
        }
      })
    };
  }
}
