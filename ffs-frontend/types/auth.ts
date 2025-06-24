export interface Meta {
  message?: string;
  error?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: RoleAssignment[];
  bidRoles: BidRoleAssignment[];
  managedBids: string[];
  status: string;
  lastLogin: string | null;
  demoAccount: boolean;
}

export interface LoginResponse {
  user: LoginResponseUser;
  accessToken: string;
  message: string;
}

export interface LoginResponseUser {
  id: number;
  name: string;
  email: string;
  cooperativeId?: number;
  districtId?: number;
  roles: LoginResponseUserRole[];
  bidRoles: LoginResponseUserRole[];
  manageBids: LoginResponseUserBids[];
  status: string;
  lastLogin: Date;
  demoAccount: boolean;
  firstName: string;
  lastName: string;
}

export interface LoginResponseUserBids {
  id: number;
  code: string;
}

export interface LoginResponseUserRole {
  type: string;
  scope: LoginResponseUserRoleScope;
  permissions: LoginResponseUserRolePermission[];
}

export interface LoginResponseUserRoleScope {
  id: number;
  type: string;
}

export interface LoginResponseUserRolePermission {
  name: string;
}

// users list response
export interface RoleAssignment {
  type: string;
  scope: {
    type: string;
    id: string;
    name?: string;
  };
  permissions: string[];
}

export interface BidRoleAssignment {
  type: string;
  scope: {
    type: string;
    id: string;
    name?: string;
  };
  permissions: string[];
}

export interface ListUsersResponseItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: RoleAssignment[];
  bidRoles: BidRoleAssignment[];
  managedBids: string[];
  status: string;
  lastLogin: string | null;
  demoAccount: boolean;
}
