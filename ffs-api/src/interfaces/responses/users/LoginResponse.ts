export interface LoginResponse {
  user: LoginResponse_User;
  accessToken: string;
  message: string;
}

export interface LoginResponse_User {
  id: number;
  name: string;
  email: string,
  cooperativeId: number | null,
  districtId: number | null,
  roles: LoginResponse_User_Role[], // Where RoleCategory - App, not Bid
  bidRoles: LoginResponse_User_Role[], // Where RoleCategory - Bid
  manageBids: LoginResponse_User_Bids[],
  status: string,
  lastLogin: Date,
  demoAccount: boolean,
  firstName: string;
  lastName: string;
}

export interface LoginResponse_User_Bids {
  id: number,
  code: string,
}

export interface LoginResponse_User_Role {
  type: string, // role name probably
  scope: LoginResponse_User_Role_Scope;
  permissions: LoginResponse_User_Role_Permission[];
}

export interface LoginResponse_User_Role_Scope {
  id: number,
  type: string
}

export interface LoginResponse_User_Role_Permission {
  name: string
}
