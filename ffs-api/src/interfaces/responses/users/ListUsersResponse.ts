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

export type ListUsersResponse = ListUsersResponseItem[];
