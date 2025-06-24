import { Permission } from "../permissions/Permission";

export interface IRolePermissionProps {
  roleId: number;
  permissionId: number;

  permission?: Partial<Permission>;
}

export class RolePermission {
  roleId: number;
  permissionId: number;

   permission?: Partial<Permission>;

  constructor({ roleId, permissionId, permission }: IRolePermissionProps) {
    this.roleId = roleId;
    this.permissionId = permissionId;
    this.permission = permission;
  }
}