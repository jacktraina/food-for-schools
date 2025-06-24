import { inject, injectable } from 'inversify';
import { IOrganizationInvitationService } from '../contracts/IOrganizationInvitationService';
import { AcceptOrganizationInviteResponse } from '../../interfaces/responses/organizations/AcceptOrganizationInviteResponse';
import { IInvitationRepository } from '../../domain/interfaces/invitations/IInvitationRepository';
import { IUserRepository } from '../../domain/interfaces/users/IUserRepository';
import { ICooperativeRepository } from '../../domain/interfaces/Cooperatives/ICooperativeRepository';
import { IDistrictRepository } from '../../domain/interfaces/Districts/IDistrictRepository';
import { IRoleRepository } from '../../domain/interfaces/roles/IRoleRepository';
import { IUserRoleRepository } from '../../domain/interfaces/userRoles/IUserRoleRepository';
import { IEmailService } from '../../application/contracts/IEmailService';
import { IDatabaseService } from '../contracts/IDatabaseService';
import TYPES from '../../shared/dependencyInjection/types';
import { User } from '../../domain/interfaces/users/User';
import { UserRole } from '../../domain/interfaces/userRoles/UserRole';
import { InvitationStatusEnum } from '../../domain/constants/InvitationStatusEnum';
import { BadRequestError } from '../../domain/core/errors/BadRequestError';
import { NotFoundError } from '../../domain/core/errors/NotFoundError';
import * as bcrypt from 'bcrypt';
import { config } from '../../config/env';
import { PrismaClient } from '@prisma/client';
import { StatusEnum } from '../../domain/constants/StatusEnum';

@injectable()
export class OrganizationInvitationService implements IOrganizationInvitationService {
  private prisma: PrismaClient;

  constructor(
    @inject(TYPES.IInvitationRepository) private invitationRepository: IInvitationRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.ICooperativeRepository) private cooperativeRepository: ICooperativeRepository,
    @inject(TYPES.IDistrictRepository) private districtRepository: IDistrictRepository,
    @inject(TYPES.IRoleRepository) private roleRepository: IRoleRepository,
    @inject(TYPES.IUserRoleRepository) private userRoleRepository: IUserRoleRepository,
    @inject(TYPES.IEmailService) private emailService: IEmailService,
    @inject(TYPES.IDatabaseService) private databaseService: IDatabaseService
  ) {
    this.prisma = this.databaseService.getClient();
  }

  async acceptInvitation(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    token: string
  ): Promise<AcceptOrganizationInviteResponse> {
    const invitation = await this.invitationRepository.findByToken(token);
    if (!invitation) {
      throw new NotFoundError('Invitation not found');
    }
    
    if (invitation.email.toLowerCase() !== email.toLowerCase()) {
      throw new BadRequestError('Email does not match invitation');
    }

    if (invitation.statusId !== InvitationStatusEnum.PENDING) {
      throw new BadRequestError('Invitation is not pending');
    }

    if (invitation.isExpired()) {
      throw new BadRequestError('Invitation has expired');
    }
    
    let organization: { id: number; name: string; organizationTypeId?: number } | null = null;
    if (invitation.cooperativeId) {
      const coop = await this.cooperativeRepository.findById(invitation.cooperativeId);
      organization = coop ? { id: coop.id, name: coop.name, organizationTypeId: 1 } : null;
    } else if (invitation.districtId) {
      const district = await this.districtRepository.findByIds(invitation.districtId);
      organization = district ? { id: district.id!, name: district.name, organizationTypeId: 2 } : null;
    }
    if (!organization) {
      throw new NotFoundError('Organization not found');
    }
    
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, config.saltRounds);

    const user = new User({
      id: 0,
      email,
      firstName,
      lastName,
      statusId: StatusEnum.ACTIVE,
      userStatus: { id: StatusEnum.ACTIVE, name: 'Active' },
      cooperativeId: invitation.cooperativeId,
      districtId: invitation.districtId,
      passwordHash,
      emailVerified: true,
      isDeleted: false,
      demoAccount: false
    });

    const createdUser = await this.userRepository.create(user);

    let roleName = '';
    if (organization.organizationTypeId === 1) { // Coop
      roleName = 'Group Admin';
    } else if (organization.organizationTypeId === 2) { // Single-District
      roleName = 'District Admin';
    } else {
      throw new BadRequestError('Invalid organization type');
    }

    const role = await this.roleRepository.findByName(roleName);
    if (!role) {
      throw new NotFoundError(`Role ${roleName} not found`);
    }

    const scope = await this.prisma.scope.create({
      data: {
        typeId: 1, // Organization scope type
        name: organization.name,
      }
    });

    const userRole = new UserRole({
      id: 0, // Will be assigned by the database
      userId: createdUser.id,
      roleId: role.id,
      scopeId: scope.id, // Using the created scope ID
    });

    await this.userRoleRepository.create(userRole);



    invitation.statusId = InvitationStatusEnum.ACCEPTED;
    await this.invitationRepository.update(invitation);

    await this.emailService.sendOrganizationInvitationAcceptedEmail(
      email,
      firstName,
      organization.name
    );

    return {
      message: 'Organization invitation accepted and user successfully registered',
      user_id: createdUser.id,
      organization_id: organization.id,
    };
  }
}
