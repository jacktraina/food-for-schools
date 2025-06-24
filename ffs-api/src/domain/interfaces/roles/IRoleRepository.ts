import { Role } from './Role';

export interface IRoleRepository {
  findById(roleId: number): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  findByName(name: string): Promise<Role | null>;
}
