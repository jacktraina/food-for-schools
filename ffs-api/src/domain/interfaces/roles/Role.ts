import { RoleCategory } from "../roleCategories/RoleCategory";
import { RolePermission } from "../rolePermissions/RolePermission";

export interface IRoleProps {
  id: number;
  name: string;
  categoryId: number;

  rolePermissions?: Partial<RolePermission>[];
  roleCategory?: Partial<RoleCategory>;
}

export class Role {
  id: number;
  name: string;
  categoryId: number;

  rolePermissions?: Partial<RolePermission>[];
  roleCategory?: Partial<RoleCategory>;

  constructor({ id, name, categoryId, rolePermissions, roleCategory }: IRoleProps) {
    this.id = id;
    this.name = name;
    this.categoryId = categoryId;
    this.rolePermissions = rolePermissions;
    this.roleCategory = roleCategory;
  }
}