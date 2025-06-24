import { PermissionsEnum } from "../../domain/constants/PermissionsEnum";
import { RolesEnum } from "../../domain/constants/RolesEnum";
import { AuthResponse_User } from "../../interfaces/responses/base/AuthResponse";

export class AuthUtils {
  // Check if user has a specific role
  static hasRole(user: AuthResponse_User, role: RolesEnum): boolean {
    return user.roles.some(r => r.id === role) || user.bidRoles.some(r => r.id === role);
  }

  // Check if user has any of the specified roles
  static hasAnyRole(user: AuthResponse_User, roles: RolesEnum[]): boolean {
    return roles.some(role => AuthUtils.hasRole(user, role));
  }

  // Check if user has a specific permission
  static hasPermission(user: AuthResponse_User, permission: PermissionsEnum): boolean {
    return user.roles.some(role => 
      role.permissions.some(p => p.name === permission)
    ) || user.bidRoles.some(role => 
      role.permissions.some(p => p.name === permission)
    );
  }

  // Check if user has any of the specified permissions
  static hasAnyPermission(user: AuthResponse_User, permissions: PermissionsEnum[]): boolean {
    return permissions.some(permission => AuthUtils.hasPermission(user, permission));
  }

  // Check if user has access to a specific bid
  static hasBidAccess(user: AuthResponse_User, bidId: number): boolean {
    return user.manageBids.some(bid => bid.id === bidId);
  }

  // Check if user is an admin (GroupAdmin, DistrictAdmin, or CoopAdmin)
  static isAdmin(user: AuthResponse_User): boolean {
    return AuthUtils.hasAnyRole(user, [
      RolesEnum.GroupAdmin,
      RolesEnum.DistrictAdmin,
      RolesEnum.CoopAdmin
    ]);
  }

  // Check if user has bid administration rights
  static isBidAdmin(user: AuthResponse_User, bidId?: number): boolean {
    if (bidId) {
      return AuthUtils.hasRole(user, RolesEnum.BidAdministrator) && 
             AuthUtils.hasBidAccess(user, bidId);
    }
    return AuthUtils.hasRole(user, RolesEnum.BidAdministrator);
  }

  // Check if user can view bids
  static canViewBids(user: AuthResponse_User, bidId?: number): boolean {
    if (bidId) {
      return (AuthUtils.hasAnyPermission(user, [PermissionsEnum.ViewBids, PermissionsEnum.ViewAll]) &&
              AuthUtils.hasBidAccess(user, bidId)) ||
             AuthUtils.isBidAdmin(user, bidId);
    }
    return AuthUtils.hasAnyPermission(user, [PermissionsEnum.ViewBids, PermissionsEnum.ViewAll]) ||
           AuthUtils.isBidAdmin(user);
  }

  // Check if user can manage specific district
  static canManageDistrict(user: AuthResponse_User, districtId: number): boolean {
    return (AuthUtils.hasAnyPermission(user, [
      PermissionsEnum.ManageDistricts,
      PermissionsEnum.EditDistrict,
      PermissionsEnum.EditAll
    ]) && user.districtId === districtId) || 
    AuthUtils.hasRole(user, RolesEnum.GroupAdmin);
  }

  // Check if user can manage specific school
  static canManageSchool(user: AuthResponse_User): boolean {
    return (AuthUtils.hasAnyPermission(user, [
      PermissionsEnum.ManageSchools,
      PermissionsEnum.EditSchool,
      PermissionsEnum.EditAll
    ]) && user.districtId !== null) || 
    AuthUtils.hasAnyRole(user, [RolesEnum.GroupAdmin, RolesEnum.DistrictAdmin]);
  }

  // Check if user has specific scope in their roles
  static hasRoleScope(user: AuthResponse_User, scopeType: string): boolean {
    return user.roles.some(r => r.scope.type === scopeType) ||
           user.bidRoles.some(r => r.scope.type === scopeType);
  }

  // Check if user is a demo account
  static isDemoAccount(user: AuthResponse_User): boolean {
    return user.demoAccount;
  }

  // Get all role names for a user
  static getRoleNames(user: AuthResponse_User): string[] {
    const roles = [
      ...user.roles.map(r => r.type),
      ...user.bidRoles.map(r => r.type)
    ];
    return [...new Set(roles)]; // Remove duplicates
  }

  // Get all permission names for a user
  static getPermissionNames(user: AuthResponse_User): string[] {
    const permissions = [
      ...user.roles.flatMap(r => r.permissions.map(p => p.name)),
      ...user.bidRoles.flatMap(r => r.permissions.map(p => p.name))
    ];
    return [...new Set(permissions)]; // Remove duplicates
  }

  // Check if user has access to specific cooperative
  static hasCooperativeAccess(user: AuthResponse_User, cooperativeId: number): boolean {
    return user.cooperativeId === cooperativeId || 
           AuthUtils.hasRole(user, RolesEnum.GroupAdmin);
  }
}