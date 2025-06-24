export interface AuthResponse_User {
  id: number;
  name: string;
  email: string,
  cooperativeId: number | null,
  districtId: number | null,
  roles: AuthResponse_User_Role[], // Where RoleCategory - App, not Bid
  bidRoles: AuthResponse_User_Role[], // Where RoleCategory - Bid
  manageBids: AuthResponse_User_Bids[],
  status: string,
  lastLogin: Date,
  demoAccount: boolean,
  firstName: string;
  lastName: string;
}

export interface AuthResponse_User_Bids {
  id: number,
  code: string,
}

export interface AuthResponse_User_Role {
  id: number,
  type: string, // role name probably
  scope: AuthResponse_User_Role_Scope;
  permissions: AuthResponse_User_Role_Permission[];
}

export interface AuthResponse_User_Role_Scope {
  id: number,
  type: string
}

export interface AuthResponse_User_Role_Permission {
  id: number,
  name: string
}
