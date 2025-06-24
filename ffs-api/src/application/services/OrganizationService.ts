import { inject, injectable } from 'inversify';
import { IOrganizationService, InviteOrganizationData, UpdateOrganizationData } from '../contracts/IOrganizationService';
import { ICooperativeRepository } from '../../domain/interfaces/Cooperatives/ICooperativeRepository';
import { IDistrictRepository } from '../../domain/interfaces/Districts/IDistrictRepository';
import { IUserRepository } from '../../domain/interfaces/users/IUserRepository';
import { IInvitationRepository } from '../../domain/interfaces/invitations/IInvitationRepository';
import { IEmailServicePort } from '../../domain/core/IEmailServicePort';
import { IOneSignalServicePort } from '../../domain/core/IOneSignalServicePort';
import { EmailTemplates } from '../../shared/emailTemplates/EmailTemplates';
import { IDatabaseService } from '../contracts/IDatabaseService';
import TYPES from '../../shared/dependencyInjection/types';
import { Cooperative } from '../../domain/interfaces/Cooperatives/Cooperative';
import { District } from '../../domain/interfaces/Districts/District';

import { Invitation } from '../../domain/interfaces/invitations/Invitation';
import { InvitationStatusEnum } from '../../domain/constants/InvitationStatusEnum';
import { BadRequestError } from '../../domain/core/errors/BadRequestError';
import { NotFoundError } from '../../domain/core/errors/NotFoundError';
import { ForbiddenError } from '../../domain/core/errors/ForbiddenError';
import { StatusEnum } from '../../domain/constants/StatusEnum';
import crypto from 'crypto';

@injectable()
export class OrganizationService implements IOrganizationService {
  private cooperativeRepository: ICooperativeRepository;
  private districtRepository: IDistrictRepository;
  private userRepository: IUserRepository;
  private invitationRepository: IInvitationRepository;
  private emailService: IEmailServicePort;
  private oneSignalService: IOneSignalServicePort;
  private emailTemplates: EmailTemplates;
  private databaseService: IDatabaseService;

  constructor(
    @inject(TYPES.ICooperativeRepository) cooperativeRepository: ICooperativeRepository,
    @inject(TYPES.IDistrictRepository) districtRepository: IDistrictRepository,
    @inject(TYPES.IUserRepository) userRepository: IUserRepository,
    @inject(TYPES.IInvitationRepository) invitationRepository: IInvitationRepository,
    @inject(TYPES.IEmailServicePort) emailService: IEmailServicePort,
    @inject(TYPES.IOneSignalServicePort) oneSignalService: IOneSignalServicePort,
    @inject(TYPES.EmailTemplates) emailTemplates: EmailTemplates,
    @inject(TYPES.IDatabaseService) databaseService: IDatabaseService
  ) {
    this.cooperativeRepository = cooperativeRepository;
    this.districtRepository = districtRepository;
    this.userRepository = userRepository;
    this.invitationRepository = invitationRepository;
    this.emailService = emailService;
    this.oneSignalService = oneSignalService;
    this.emailTemplates = emailTemplates;
    this.databaseService = databaseService;
  }

  async inviteOrganization(data: InviteOrganizationData, invitedBy: number): Promise<{ message: string }> {
    try {
      const inviter = await this.userRepository.getUserDetails(invitedBy);
      if (!inviter) {
        throw new NotFoundError('Inviter not found');
      }

      const adminRoles = inviter.getAdminRoles().map(role => role.role?.name || '');
      if (!adminRoles.includes('Super-Admin')) {
        throw new ForbiddenError('Only Super-Admins can invite organizations');
      }

      const existingInvitation = await this.invitationRepository.findByEmail(data.email);
      if (existingInvitation && existingInvitation.statusId === InvitationStatusEnum.PENDING) {
        throw new BadRequestError('An invitation has already been sent to this email');
      }

      const result = await this.databaseService.runInTransaction(async (prisma) => {
        let createdOrganization: { id: number; name: string };
        
        if (data.organization_type === 'cooperative') {
          const existingCoop = await this.cooperativeRepository.findAll().then(coops => 
            coops.find(c => c.name === data.name));
          if (existingCoop) {
            throw new BadRequestError('Cooperative with this name already exists');
          }
          
          const cooperativeCode = `COOP-${Date.now()}`;
          const cooperative = new Cooperative({
            id: 0,
            code: cooperativeCode,
            name: data.name,
            organizationTypeId: 1,
            userStatusId: StatusEnum.ACTIVE,
            description: null,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          const coop = await this.cooperativeRepository.createWithTransaction(prisma, cooperative);
          createdOrganization = { id: coop.id, name: coop.name };
        } else if (data.organization_type === 'district') {
          const existingDistrict = await this.districtRepository.findAll().then(districts => 
            districts.find(d => d.name === data.name));
          if (existingDistrict) {
            throw new BadRequestError('District with this name already exists');
          }
          
          const district = new District({
            name: data.name,
            location: null,
            directorName: null,
            streetAddress1: null,
            streetAddress2: null,
            city: null,
            state: null,
            zipCode: null,
            phone: null,
            email: null,
            fax: null,
            website: null,
            statusId: StatusEnum.ACTIVE,
            districtEnrollment: null,
            raNumber: null,
            numberOfSchools: null,
            numberOfStudents: null,
            annualBudget: null,
            superintendentName: null,
            establishedYear: null,
            cooperativeId: null,
            code: null,
            participatingIn: null,
            shippingAddress: null,
            description: null,
            notes: null
          });
          
          const createdDistrict = await this.districtRepository.createWithTransaction(prisma, district);
          createdOrganization = { id: createdDistrict.id!, name: createdDistrict.name };
        } else {
          throw new BadRequestError(`Organization type '${data.organization_type}' not found`);
        }

        const token = crypto.randomBytes(32).toString('hex');
        
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);

        const invitation = new Invitation({
          id: 0,
          email: data.email,
          cooperativeId: data.organization_type === 'cooperative' ? createdOrganization.id : null,
          districtId: data.organization_type === 'district' ? createdOrganization.id : null,
          invitedBy: invitedBy,
          statusId: InvitationStatusEnum.PENDING,
          expirationDate: expirationDate,
          invitedRoleId: null,
          token: token
        });

        await this.invitationRepository.createWithTransaction(prisma, invitation);

        return { organization: createdOrganization, token: token };
      });

      const transactionResult = Array.isArray(result) ? result[0] : result;
      const invitationLink = `${process.env.CLIENT_URL}/register?token=${transactionResult.token}&email=${encodeURIComponent(data.email)}`;

      const emailBody = this.emailTemplates.generateInvitationEmailTemplate(
        invitationLink,
        `${inviter.firstName} ${inviter.lastName}`,
        data.name
      );

      await this.oneSignalService.sendEmail(
        data.email,
        `You've been invited to join ${process.env.COMPANY_NAME || 'Food for Schools'} as an organization`,
        emailBody
      );

      return { message: 'Organization invitation sent' };
    } catch (error) {
      console.error("Error in inviteOrganization:", error);
      if (error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw new BadRequestError("Failed to invite organization");
    }
  }

  async updateOrganization(id: number, data: UpdateOrganizationData, updatedBy: number): Promise<{ message: string }> {
    try {
      const updater = await this.userRepository.getUserDetails(updatedBy);
      if (!updater) {
        throw new NotFoundError('User not found');
      }

      const adminRoles = updater.getAdminRoles().map(role => role.role?.name || '');
      if (!adminRoles.includes('Super-Admin')) {
        throw new ForbiddenError('Only Super-Admins can update organizations');
      }

      const cooperative = await this.cooperativeRepository.findById(id);
      if (cooperative) {
        const result = await this.databaseService.runInTransaction(async (prisma) => {
          const updateProps = Cooperative.mapUpdateRequestToProps(data);
          const updatedCooperative = cooperative!.update(updateProps);
          
          await this.cooperativeRepository.updateWithTransaction(prisma, updatedCooperative);
          
          return { message: 'Organization updated successfully' };
        });

        return Array.isArray(result) ? result[0] : result;
      }

      const district = await this.districtRepository.findByIds(id);
      if (district) {
        const result = await this.databaseService.runInTransaction(async (prisma) => {
          const updateProps = District.mapUpdateRequestToProps({
            streetAddress1: data.streetAddress1,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            phone: data.phone,
            email: data.email,
          });
          const updatedDistrict = district!.update(updateProps);
          
          await this.districtRepository.updateWithTransaction(prisma, updatedDistrict);
          
          return { message: 'Organization updated successfully' };
        });

        return Array.isArray(result) ? result[0] : result;
      }

      throw new NotFoundError('Organization');
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw new BadRequestError('Failed to update organization');
    }
  }
}
