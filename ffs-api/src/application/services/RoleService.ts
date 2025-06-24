// import { inject, injectable } from 'inversify';
// import TYPES from '../../shared/dependencyInjection/types';
// import { IRoleService } from '../contracts/IRoleService';
// import { IRoleRepository } from '../../domain/interfaces/roles/IRoleRepository';
// import { AppError } from '../../interfaces/middleware/errorHandler';
// import { Role } from '../../domain/interfaces/roles/Role';
// import { RolesResponse } from '../../interfaces/responses/users/RolesResponse';

// @injectable()
// export class RoleService implements IRoleService {
//   private roleRepository: IRoleRepository;

//   constructor(
//     @inject(TYPES.IRoleRepository) roleRepository: IRoleRepository
//   ) {
//     this.roleRepository = roleRepository;
//   }

//   async getRoleById(roleId: number): Promise<Role> {
//     const role = await this.roleRepository.findById(roleId);
//     if (!role) {
//       throw new AppError('Role not found', 404);
//     }
//     return role;
//   }

//   async getRoles(): Promise<RolesResponse> {
//     const roles = await this.roleRepository.findAll();
//     return {
//       roles: roles.map(x => ({
//         id: x.id,
//         roleName: x.roleName,
//         description: x.description ?? undefined
//       }))
//     };
//   }
// }
