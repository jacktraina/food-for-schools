import { AuthResponse_User, AuthResponse_User_Role } from "../../interfaces/responses/base/AuthResponse";
import { LoginResponse_User, LoginResponse_User_Role } from "../../interfaces/responses/users/LoginResponse";

export class LoginResponseMapper {
  static mapFromAuthResponse(authUser: AuthResponse_User): LoginResponse_User {
    return {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      cooperativeId: authUser.cooperativeId,
      districtId: authUser.districtId,
      roles: authUser.roles.map(LoginResponseMapper.mapRole),
      bidRoles: authUser.bidRoles.map(LoginResponseMapper.mapRole),
      manageBids: authUser.manageBids.map(bid => ({
        id: bid.id,
        code: bid.code,
      })),
      status: authUser.status,
      lastLogin: authUser.lastLogin,
      demoAccount: authUser.demoAccount,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
    };
  }

  private static mapRole(role: AuthResponse_User_Role): LoginResponse_User_Role {
    return {
      type: role.type,
      scope: {
        id: role.scope.id,
        type: role.scope.type,
      },
      permissions: role.permissions.map(permission => ({
        name: permission.name,
      })),
    };
  }
}
