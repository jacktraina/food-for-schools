import { Role } from "../../domain/interfaces/roles/Role";
import { RolesResponse } from "../../interfaces/responses/users/RolesResponse";

export interface IRoleService {
  getRoleById(roleId: number): Promise<Role>;
  getRoles(): Promise<RolesResponse>;
}
