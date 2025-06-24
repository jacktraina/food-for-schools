export interface RoleResponseItem {
  id: number;
  roleName: string;
  description?: string;
}

export interface RolesResponse {
  roles: RoleResponseItem[];
}

