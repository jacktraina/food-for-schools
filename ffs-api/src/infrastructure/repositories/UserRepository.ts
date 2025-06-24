import { inject } from 'inversify';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';
import { IUserRepository } from '../../domain/interfaces/users/IUserRepository';
import { User } from '../../domain/interfaces/users/User';
import TYPES from '../../shared/dependencyInjection/types';
import { PrismaClient, Prisma } from '@prisma/client';
import { UserRole } from '../../domain/interfaces/userRoles/UserRole';
import { Role } from '../../domain/interfaces/roles/Role';
import { Scope } from '../../domain/interfaces/scopes/Scope';
import { Bid } from '../../domain/interfaces/Bids/Bid';
import { ScopeType } from '../../domain/interfaces/scopeTypes/ScopeType';
import { UserMapper } from '../mappers/UserMapper';
import { UserManagedBid } from '../../domain/interfaces/UserManagedBids/UserManagedBid';
import { RolePermission } from '../../domain/interfaces/rolePermissions/RolePermission';
import { Permission } from '../../domain/interfaces/permissions/Permission';
import { RoleCategory } from '../../domain/interfaces/roleCategories/RoleCategory';
import { UserStatus } from '../../domain/interfaces/userStatuses/UserStatus';


export class UserRepository implements IUserRepository {
  private userModel: PrismaClient['user'];
  private prisma;
  
  constructor(@inject(TYPES.IDatabaseService) database: IDatabaseService) {
    this.prisma = database.getClient();
    this.userModel = database.getClient().user;
  }


  async findById(id: number): Promise<User | null> {
    const user = await this.userModel.findUnique({
      where: { id },
      include: {
        userStatus: true,
      }
    });

    return user ? new User({ ...user}) : null;
  }

  async getUserDetails(userId: number): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userStatus: true,

        userRoles: {
          include: {
            role: {
              include: {
                roleCategory: true,
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              }
            },
            scope: {
              include: {
                scopeType: true
              }
            }
          }
        },
        userManagedBids: {
          include: {
            bid: {
              select: {
                id: true,
                name: true,
                bidYear: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!userData) {
      return null;
    }

    // Map user roles
    const userRoles = (userData as unknown as { userRoles?: { id: number; userId: number; roleId: number; scopeId: number; role: { id: number; name: string; categoryId: number; rolePermissions?: { permission: { id: number; name: string } }[]; roleCategory?: { id: number; name: string } }; scope: { id: number; typeId: number; name: string; scopeType: { id: number; name: string } } }[] }).userRoles?.map((userRole) =>
      new UserRole({
        id: userRole.id,
        userId: userRole.userId,
        roleId: userRole.roleId,
        scopeId: userRole.scopeId,
        role: new Role({
          id: userRole.role.id,
          name: userRole.role.name,
          categoryId: userRole.role.categoryId,
          rolePermissions: userRole.role.rolePermissions?.map(rp => new RolePermission({
            roleId: userRole.roleId,
            permissionId: rp.permission.id,
            permission: new Permission({
              id: rp.permission.id,
              name: rp.permission.name
            })
          })) || [],
          roleCategory: userRole.role.roleCategory ? new RoleCategory({
            id: userRole.role.roleCategory.id,
            name: userRole.role.roleCategory.name
          }) : undefined,
        }),
        scope: new Scope({
          id: userRole.scope.id,
          typeId: userRole.scope.typeId,
          name: userRole.scope.name,
          scopeType: new ScopeType({
            id: userRole.scope.scopeType.id,
            name: userRole.scope.scopeType.name,
          })
        })
      })
    ) || [];

    // Map managed bids
    const managedBids = (userData as { userManagedBids?: { userId: number; bidId: number; bid: { id: number; code?: string; name?: string; bidYear?: string; status?: string } }[] }).userManagedBids?.map((managedBid) =>
      new UserManagedBid({
        userId: managedBid.userId,
        bidId: managedBid.bidId,
        bid: new Bid({
          id: managedBid.bid.id,
          code: managedBid.bid.code || `BID-${managedBid.bid.id}`,
          name: managedBid.bid.name || `Bid ${managedBid.bid.id}`,
          bidYear: managedBid.bid.bidYear || '2024',
          status: managedBid.bid.status || 'In Process'
        })
      })
    ) || [];

    return new User({
      id: userData.id,
      email: userData.email,
      passwordHash: userData.passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      statusId: userData.statusId,
      userStatus: (userData as { userStatus?: { id: number; name: string } }).userStatus || { id: userData.statusId, name: 'Active' },
      lastLogin: userData.lastLogin,
      demoAccount: userData.demoAccount || false,
      cooperativeId: (userData as { cooperativeId?: number }).cooperativeId || null,
      districtId: (userData as { districtId?: number }).districtId || null,
      isDeleted: userData.isDeleted,
      emailVerified: userData.emailVerified,
      userRoles,
      managedBids
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findUnique({
      where: { email },
      include: this.getBaseUserIncludes(),
    });

    return user ? new User({ ...user}) : null;
  }

  async update(entity: User): Promise<User> {
    const data = UserMapper.toPrisma(entity);
      
    const dataObject = await this.userModel.update({
      where: { id: entity.id },
      data: data,
      include: this.getBaseUserIncludes(),
    });
      
    return new User(dataObject);
  }

  async create(user: User): Promise<User> {
    const data = {
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      statusId: user.statusId || 1,
      emailVerified: user.emailVerified,
      isDeleted: user.isDeleted,
      demoAccount: user.demoAccount
    } as unknown as Prisma.UserCreateInput;

    const createdUser = await this.prisma.user.create({
      data: data,
      include: {
        userStatus: true
      },
    });

    return new User({
      id: createdUser.id,
      email: createdUser.email,
      passwordHash: createdUser.passwordHash,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      statusId: createdUser.statusId,
      userStatus: (createdUser as { userStatus?: { id: number; name: string } }).userStatus || { id: createdUser.statusId, name: 'Active' },
      lastLogin: createdUser.lastLogin,
      demoAccount: createdUser.demoAccount || false,
      cooperativeId: (createdUser as { cooperativeId?: number }).cooperativeId || null,
      districtId: (createdUser as { districtId?: number }).districtId || null,
      isDeleted: createdUser.isDeleted,
      emailVerified: createdUser.emailVerified,
      userRoles: [],
      managedBids: []
    });
  }

  async findDistrictById(districtId: number): Promise<{ id: number; cooperativeId: number } | null> {
    const district = await this.prisma.district.findUnique({
      where: { id: districtId }
    });
    
    return district ? { id: district.id, cooperativeId: (district as unknown as { cooperativeId?: number }).cooperativeId || 0 } : null;
  }

  async updatePassword(userId: number, password: string): Promise<void> {
    await this.userModel.update({
      where: { id: userId },
      data: { passwordHash: password },
    });
  }

  private getBaseUserIncludes() {
    return {
      userStatus: true,
    };
  }
  
  async findAllUsers(): Promise<User[]> {
    const usersData = await this.prisma.user.findMany({
      where: { isDeleted: false },
      include: {
        userStatus: true,

        userRoles: {
          include: {
            role: {
              include: {
                roleCategory: true,
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              }
            },
            scope: {
              include: {
                scopeType: true
              }
            }
          }
        },
        userManagedBids: {
          include: {
            bid: {
              select: {
                id: true,
                name: true,
                bidYear: true,
                status: true
              }
            }
          }
        }
      }
    });

    return Promise.all(usersData.map(async (userData) => {
      // Map user roles
      const userRoles = (userData as unknown as { userRoles?: { id: number; userId: number; roleId: number; scopeId: number; role: { id: number; name: string; categoryId: number; rolePermissions?: { permission: { id: number; name: string } }[]; roleCategory?: { id: number; name: string } }; scope: { id: number; typeId: number; name: string; scopeType: { id: number; name: string } } }[] }).userRoles?.map((userRole) =>
        new UserRole({
          id: userRole.id,
          userId: userRole.userId,
          roleId: userRole.roleId,
          scopeId: userRole.scopeId,
          role: new Role({
            id: userRole.role.id,
            name: userRole.role.name,
            categoryId: userRole.role.categoryId,
            rolePermissions: userRole.role.rolePermissions?.map(rp => ({
              roleId: userRole.roleId,
              permissionId: rp.permission.id,
              permission: {
                id: rp.permission.id,
                name: rp.permission.name
              }
            })) || [],
            roleCategory: userRole.role.roleCategory ? {
              id: userRole.role.roleCategory.id,
              name: userRole.role.roleCategory.name
            } : undefined,
          }),
          scope: new Scope({
            id: userRole.scope.id,
            typeId: userRole.scope.typeId,
            name: userRole.scope.name,
            scopeType: new ScopeType({
              id: userRole.scope.scopeType.id,
              name: userRole.scope.scopeType.name,
            })
          })
        })
      ) || [];

      // Map managed bids
      const managedBids = (userData as { userManagedBids?: { userId: number; bidId: number; bid: { id: number; code?: string; name?: string; bidYear?: string; status?: string } }[] }).userManagedBids?.map((managedBid) =>
        new UserManagedBid({
          userId: managedBid.userId,
          bidId: managedBid.bidId,
          bid: new Bid({
            id: managedBid.bid.id,
            code: managedBid.bid.code || `BID-${managedBid.bid.id}`,
            name: managedBid.bid.name || `Bid ${managedBid.bid.id}`,
            bidYear: managedBid.bid.bidYear || '2024',
            status: managedBid.bid.status || 'In Process'
          })
        })
      ) || [];

      return new User({
        id: userData.id,
        email: userData.email,
        passwordHash: userData.passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        statusId: userData.statusId,
        userStatus: (userData as { userStatus?: { id: number; name: string } }).userStatus || { id: userData.statusId, name: 'Active' },
        lastLogin: userData.lastLogin,
        demoAccount: userData.demoAccount || false,
        cooperativeId: (userData as { cooperativeId?: number }).cooperativeId || null,
        districtId: (userData as { districtId?: number }).districtId || null,
        isDeleted: userData.isDeleted,
        emailVerified: userData.emailVerified,
        userRoles,
        managedBids
      });
    }));
  }

  async searchUsers(filters: {
    search?: string;
    role?: string;
    bidRole?: string;
    status?: string;
    district?: string;
  }): Promise<User[]> {
    const whereConditions: Record<string, unknown> = {
      isDeleted: false
    };

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      whereConditions.OR = [
        {
          firstName: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          lastName: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          userRoles: {
            some: {
              role: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              }
            }
          }
        }
      ];
    }

    if (filters.role || filters.bidRole) {
      const roleConditions = [];
      
      if (filters.role) {
        roleConditions.push({
          role: {
            name: filters.role,
            roleCategory: {
              name: 'App'
            }
          }
        });
      }
      
      if (filters.bidRole) {
        roleConditions.push({
          role: {
            name: filters.bidRole,
            roleCategory: {
              name: 'Bid'
            }
          }
        });
      }
      
      whereConditions.userRoles = {
        some: {
          OR: roleConditions
        }
      };
    }

    if (filters.status) {
      whereConditions.userStatus = {
        name: filters.status
      };
    }

    if (filters.district) {
      whereConditions.districtId = parseInt(filters.district);
    }

    const usersData = await this.prisma.user.findMany({
      where: whereConditions,
      include: {
        userStatus: true,
        userRoles: {
          include: {
            role: {
              include: {
                roleCategory: true,
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              }
            },
            scope: {
              include: {
                scopeType: true
              }
            }
          }
        },
        userManagedBids: {
          include: {
            bid: {
              select: {
                id: true,
                name: true,
                bidYear: true,
                status: true
              }
            }
          }
        }
      }
    });

    return Promise.all(usersData.map(async (userData) => {
      const userRoles = (userData as unknown as { userRoles?: { id: number; userId: number; roleId: number; scopeId: number; role: { id: number; name: string; categoryId: number; rolePermissions?: { permission: { id: number; name: string } }[]; roleCategory?: { id: number; name: string } }; scope: { id: number; typeId: number; name: string; scopeType: { id: number; name: string } } }[] }).userRoles?.map((userRole) =>
        new UserRole({
          id: userRole.id,
          userId: userRole.userId,
          roleId: userRole.roleId,
          scopeId: userRole.scopeId,
          role: new Role({
            id: userRole.role.id,
            name: userRole.role.name,
            categoryId: userRole.role.categoryId,
            rolePermissions: userRole.role.rolePermissions?.map(rp => ({
              roleId: userRole.roleId,
              permissionId: rp.permission.id,
              permission: {
                id: rp.permission.id,
                name: rp.permission.name
              }
            })) || [],
            roleCategory: userRole.role.roleCategory ? {
              id: userRole.role.roleCategory.id,
              name: userRole.role.roleCategory.name
            } : undefined,
          }),
          scope: new Scope({
            id: userRole.scope.id,
            typeId: userRole.scope.typeId,
            name: userRole.scope.name,
            scopeType: new ScopeType({
              id: userRole.scope.scopeType.id,
              name: userRole.scope.scopeType.name,
            })
          })
        })
      ) || [];

      const managedBids = (userData as { userManagedBids?: { userId: number; bidId: number; bid: { id: number; code?: string; name?: string; bidYear?: string; status?: string } }[] }).userManagedBids?.map((managedBid) =>
        new UserManagedBid({
          userId: managedBid.userId,
          bidId: managedBid.bidId,
          bid: new Bid({
            id: managedBid.bid.id,
            code: managedBid.bid.code || `BID-${managedBid.bid.id}`,
            name: managedBid.bid.name || `Bid ${managedBid.bid.id}`,
            bidYear: managedBid.bid.bidYear || '2024',
            status: managedBid.bid.status || 'In Process'
          })
        })
      ) || [];

      return new User({
        id: userData.id,
        email: userData.email,
        passwordHash: userData.passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        statusId: userData.statusId,
        userStatus: (userData as { userStatus?: { id: number; name: string } }).userStatus || { id: userData.statusId, name: 'Active' },
        lastLogin: userData.lastLogin,
        demoAccount: userData.demoAccount || false,
        cooperativeId: (userData as { cooperativeId?: number }).cooperativeId || null,
        districtId: (userData as { districtId?: number }).districtId || null,
        isDeleted: userData.isDeleted,
        emailVerified: userData.emailVerified,
        userRoles,
        managedBids
      });
    }));
  }

  async markAsEmailVerified(userId: number): Promise<void> {
    await this.userModel.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  async findManyByIds(ids: number[]): Promise<User[]> {
    const usersData = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      include: {
        userStatus: true,
        userRoles: {
          include: {
            role: {
              include: {
                roleCategory: true,
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
            scope: {
              include: {
                scopeType: true,
              },
            },
          },
        },
        userManagedBids: {
          include: {
            bid: {
              select: {
                id: true,
                name: true,
                bidYear: true,
                status: true,
                code: true,
              },
            },
          },
        },
      },
    });
  
    return usersData.map((userData) => {
      // Map user roles
      const userRoles = userData.userRoles?.map((userRole) =>
        new UserRole({
          id: userRole.id,
          userId: userRole.userId,
          roleId: userRole.roleId,
          scopeId: userRole.scopeId,
          role: new Role({
            id: userRole.role.id,
            name: userRole.role.name,
            categoryId: userRole.role.categoryId,
            rolePermissions: userRole.role.rolePermissions?.map(
              (rp) =>
                new RolePermission({
                  roleId: userRole.roleId,
                  permissionId: rp.permission.id,
                  permission: new Permission({
                    id: rp.permission.id,
                    name: rp.permission.name,
                  }),
                })
            ) || [],
            roleCategory: userRole.role.roleCategory
              ? new RoleCategory({
                  id: userRole.role.roleCategory.id,
                  name: userRole.role.roleCategory.name,
                })
              : undefined,
          }),
          scope: new Scope({
            id: userRole.scope.id,
            typeId: userRole.scope.typeId,
            name: userRole.scope.name,
            scopeType: new ScopeType({
              id: userRole.scope.scopeType.id,
              name: userRole.scope.scopeType.name,
            }),
          }),
        })
      ) || [];
  
      // Map managed bids
      const managedBids = userData.userManagedBids?.map((managedBid) =>
        new UserManagedBid({
          userId: managedBid.userId,
          bidId: managedBid.bidId,
          bid: new Bid({
            id: managedBid.bid.id,
            code: managedBid.bid.code || `BID-${managedBid.bid.id}`,
            name: managedBid.bid.name || `Bid ${managedBid.bid.id}`,
            bidYear: managedBid.bid.bidYear || '2024',
            status: managedBid.bid.status || 'In Process',
          }),
        })
      ) || [];
  
      return new User({
        id: userData.id,
        email: userData.email,
        passwordHash: userData.passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        statusId: userData.statusId,
        userStatus: userData.userStatus
          ? new UserStatus({
              id: userData.userStatus.id,
              name: userData.userStatus.name,
            })
          : { id: userData.statusId, name: 'Active' },
        lastLogin: userData.lastLogin,
        demoAccount: userData.demoAccount || false,
        cooperativeId: userData.cooperativeId || null,
        districtId: userData.districtId || null,
        isDeleted: userData.isDeleted,
        emailVerified: userData.emailVerified,
        userRoles,
        managedBids,
      });
    });
  }

  async softDelete(id: number): Promise<void> {
    try {
      await this.userModel.update({
        where: { id },
        data: { isDeleted: true }
      });
    } catch (error) {
      console.error('Error soft deleting user:', error);
      throw error;
    }
  }
}
