import { Role } from "../roles/Role";
import { Scope } from "../scopes/Scope";

export interface IUserRoleProps {
  id: number;
  userId: number;
  roleId: number;
  scopeId: number;

  role?: Partial<Role>;
  scope?: Partial<Scope>;
}

export class UserRole {
  id: number;
  userId: number;
  roleId: number;
  scopeId: number;

  role?: Partial<Role>;
  scope?: Partial<Scope>;

  constructor({ id, userId, roleId, scopeId, role, scope }: IUserRoleProps) {
    this.id = id;
    this.userId = userId;
    this.roleId = roleId;
    this.scopeId = scopeId;
    this.role = role;
    this.scope = scope;
  }
}