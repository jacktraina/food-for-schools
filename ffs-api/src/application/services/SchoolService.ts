import { inject, injectable } from 'inversify';
import { ISchoolService } from '../contracts/ISchoolService';
import { ISchoolRepository } from '../../domain/interfaces/Schools/ISchoolRepository';
import { IUserRepository } from '../../domain/interfaces/users/IUserRepository';
import { School } from '../../domain/interfaces/Schools/School';
import TYPES from '../../shared/dependencyInjection/types';
import { BadRequestError } from '../../domain/core/errors/BadRequestError';
import { ForbiddenError } from '../../domain/core/errors/ForbiddenError';
import { NotFoundError } from '../../domain/core/errors/NotFoundError';
import { StatusEnum } from '../../domain/constants/StatusEnum';
import { CreateSchoolRequest } from '../../interfaces/requests/schools/CreateSchoolRequest';
import { IContactRepository } from '../../domain/interfaces/Contacts/IContactRepository';
import { IOrganizationContactRepository } from '../../domain/interfaces/OrganizationContacts/IOrganizationContactRepository';
import { Contact, ContactType } from '../../domain/interfaces/Contacts/Contact';
import { OrganizationContact } from '../../domain/interfaces/OrganizationContacts/OrganizationContact';
import { IDatabaseService } from '../contracts/IDatabaseService';
import { IDistrictRepository } from '../../domain/interfaces/Districts/IDistrictRepository';
import { GetSchoolDetailsResponse } from '../../interfaces/responses/schools/GetSchoolDetailsResponse';

@injectable()
export class SchoolService implements ISchoolService {
  constructor(
    @inject(TYPES.ISchoolRepository) private schoolRepository: ISchoolRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IContactRepository) private contactRepository: IContactRepository,
    @inject(TYPES.IOrganizationContactRepository)
    private organizationContactRepository: IOrganizationContactRepository,
    @inject(TYPES.IDatabaseService) private databaseService: IDatabaseService,
    @inject(TYPES.IDistrictRepository) private districtRepository: IDistrictRepository
  ) {}

  async createSchool(
    districtId: number,
    schoolData: CreateSchoolRequest,
    userId: number
  ): Promise<School> {
    const user = await this.userRepository.getUserDetails(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const adminRoles = user.getAdminRoles();
    const hasRequiredRole = adminRoles.some(
      (role) => role.role?.name === 'Group Admin' || role.role?.name === 'District Admin'
    );

    if (!hasRequiredRole) {
      throw new ForbiddenError('User does not have required permissions');
    }

    const district = await this.userRepository.findDistrictById(districtId);
    if (!district) {
      throw new NotFoundError('District not found');
    }

    if (district.cooperativeId !== (user.cooperativeId || user.districtId)) {
      throw new ForbiddenError('District does not belong to your organization');
    }

    const validSchoolTypes = ['High School', 'Middle School', 'Elementary School', 'Childcare'];
    if (!validSchoolTypes.includes(schoolData.schoolType)) {
      throw new BadRequestError('Invalid school type');
    }

    try {
      const result = await this.databaseService.runInTransaction(async (prisma) => {
        const school = School.create(schoolData, districtId, StatusEnum.ACTIVE);
        const createdSchool = await this.schoolRepository.createWithTransaction(prisma, school);

        if (!createdSchool?.id) {
          throw new Error('Failed to create school');
        }

        if (schoolData.contactFirstName && schoolData.contactLastName) {
          const primaryContact = new Contact({
            firstName: schoolData.contactFirstName,
            lastName: schoolData.contactLastName,
            title: schoolData.contactTitle ?? null,
            phone: schoolData.contactPhone ?? null,
            email: schoolData.contactEmail ?? null,
            contactType: ContactType.SCHOOL,
          });

          const createdPrimaryContact = await this.contactRepository.createWithTransaction(
            prisma,
            primaryContact
          );

          if (createdPrimaryContact.id) {
            await this.organizationContactRepository.createWithTransaction(
              prisma,
              new OrganizationContact({
                contactId: createdPrimaryContact.id,
                organizationId: createdSchool.id,
                organizationTypeId: 2,
                rank: 1,
                districtId: districtId,
              })
            );
          }
        }

        if (schoolData.overrideDistrictBilling && schoolData.billingContact) {
          const [firstName, ...lastNameParts] = schoolData.billingContact.split(' ');
          const lastName = lastNameParts.join(' ') || 'Unknown';

          const billingContact = new Contact({
            firstName: firstName || 'Unknown',
            lastName: lastName,
            phone: schoolData.billingPhone ?? null,
            email: schoolData.billingEmail ?? null,
            address1: schoolData.billingAddressLine1 ?? null,
            address2: schoolData.billingAddressLine2 ?? null,
            city: schoolData.billingCity ?? null,
            state: schoolData.billingState ?? null,
            zipcode: schoolData.billingZipCode ?? null,
            contactType: ContactType.BILLING,
          });

          const createdBillingContact = await this.contactRepository.createWithTransaction(
            prisma,
            billingContact
          );

          if (createdBillingContact.id) {
            await this.organizationContactRepository.createWithTransaction(
              prisma,
              new OrganizationContact({
                contactId: createdBillingContact.id,
                organizationId: createdSchool.id,
                organizationTypeId: 2,
                rank: 1,
                districtId: districtId,
              })
            );
          }
        }

        return createdSchool;
      });

      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error('Error in createSchool:', error);
      if (error instanceof Error) {
        throw new BadRequestError(error.message);
      }
      throw new BadRequestError('Failed to create school');
    }
  }

  async getSchoolsByDistrictId(districtId: number, userId: number): Promise<School[]> {
    const user = await this.userRepository.getUserDetails(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const adminRoles = user.getAdminRoles();
    const hasRequiredRole = adminRoles.some(
      (role) =>
        role.role?.name === 'Group Admin' ||
        role.role?.name === 'District Admin' ||
        role.role?.name === 'School Admin' ||
        role.role?.name === 'Viewer'
    );

    if (!hasRequiredRole) {
      throw new ForbiddenError('User does not have required permissions');
    }

    const district = await this.userRepository.findDistrictById(districtId);
    if (!district) {
      throw new NotFoundError('District not found');
    }

    if (district.cooperativeId !== (user.cooperativeId || user.districtId)) {
      throw new ForbiddenError('District does not belong to your organization');
    }

    return await this.schoolRepository.findByDistrictIdWithStatus(districtId);
  }

  async getSchoolsDetailedByDistrictId(districtId: number, userId: number): Promise<School[]> {
    const user = await this.userRepository.getUserDetails(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const adminRoles = user.getAdminRoles();
    const hasRequiredRole = adminRoles.some(
      (role) =>
        role.role?.name === 'Group Admin' ||
        role.role?.name === 'District Admin' ||
        role.role?.name === 'School Admin' ||
        role.role?.name === 'Viewer'
    );

    if (!hasRequiredRole) {
      throw new ForbiddenError('User does not have required permissions');
    }

    const district = await this.userRepository.findDistrictById(districtId);
    if (!district) {
      throw new NotFoundError('District not found');
    }

    if (district.cooperativeId !== (user.cooperativeId || user.districtId)) {
      throw new ForbiddenError('District does not belong to your organization');
    }

    return await this.schoolRepository.findByDistrictIdWithStatus(districtId);
  }

  async updateSchool(
    districtId: number,
    schoolId: number,
    schoolData: {
      name?: string;
      enrollment?: number;
      schoolType?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      shippingAddressLine1?: string;
      shippingAddressLine2?: string;
      shippingAddressCity?: string;
      shippingAddressState?: string;
      shippingAddressZipCode?: string;
      schoolContactName?: string;
      schoolContactPhone?: string;
      schoolContactEmail?: string;
      notes?: string;
      overrideDistrictBilling?: boolean;
      contactFirstName?: string;
      contactLastName?: string;
      contactTitle?: string;
      contactPhone?: string;
      contactEmail?: string;
      billingContact?: string;
      billingPhone?: string;
      billingEmail?: string;
      billingAddressLine1?: string;
      billingAddressLine2?: string;
      billingCity?: string;
      billingState?: string;
      billingZipCode?: string;
      fax?: string;
      shippingInstructions?: string;
      shippingDeliveryHours?: string;
    },
    userId: number
  ): Promise<School> {
    const user = await this.userRepository.getUserDetails(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const adminRoles = user.getAdminRoles();
    const hasRequiredRole = adminRoles.some(
      (role) =>
        role.role?.name === 'Group Admin' ||
        role.role?.name === 'District Admin' ||
        role.role?.name === 'School Admin'
    );

    if (!hasRequiredRole) {
      throw new ForbiddenError('User does not have required permissions');
    }

    const district = await this.userRepository.findDistrictById(districtId);
    if (!district) {
      throw new NotFoundError('District not found');
    }

    if (district.cooperativeId !== (user.cooperativeId || user.districtId)) {
      throw new ForbiddenError('District does not belong to your organization');
    }

    const existingSchool = await this.schoolRepository.findById(schoolId);
    if (!existingSchool) {
      throw new NotFoundError('School not found');
    }

    if (existingSchool.districtId !== districtId) {
      throw new ForbiddenError('School does not belong to the specified district');
    }

    if (existingSchool.isDeleted) {
      throw new NotFoundError('School has been deleted');
    }

    if (schoolData.schoolType) {
      const validSchoolTypes = ['High School', 'Middle School', 'Elementary School', 'Childcare'];
      if (!validSchoolTypes.includes(schoolData.schoolType)) {
        throw new BadRequestError('Invalid school type');
      }
    }

    const updateProps = School.mapUpdateRequestToProps(schoolData);

    try {
      const result = await this.databaseService.runInTransaction(async (prisma) => {
        const updatedSchool = existingSchool.update(updateProps);

        const finalUpdatedSchool = await this.schoolRepository.updateWithTransaction(
          prisma,
          updatedSchool
        );
        if (!finalUpdatedSchool) {
          throw new BadRequestError('Failed to update school');
        }

        if (schoolData.contactFirstName && schoolData.contactLastName) {
          let primaryContact: Contact;
          let existingContact: Contact | null = null;

          if (schoolData.contactEmail) {
            existingContact = await this.contactRepository.findByEmail(schoolData.contactEmail);
          }

          if (existingContact) {
            primaryContact = existingContact.update({
              firstName: schoolData.contactFirstName,
              lastName: schoolData.contactLastName,
              title: schoolData.contactTitle,
              phone: schoolData.contactPhone,
              email: schoolData.contactEmail,
              contactType: ContactType.SCHOOL,
            });
            await this.contactRepository.updateWithTransaction(prisma, primaryContact);
          } else {
            primaryContact = new Contact({
              firstName: schoolData.contactFirstName,
              lastName: schoolData.contactLastName,
              title: schoolData.contactTitle,
              phone: schoolData.contactPhone,
              email: schoolData.contactEmail,
              contactType: ContactType.SCHOOL,
              createdAt: new Date(),
            });
            primaryContact = await this.contactRepository.createWithTransaction(
              prisma,
              primaryContact
            );
          }

          const existingOrgContacts = await this.organizationContactRepository.findByOrganizationId(
            finalUpdatedSchool.id!
          );
          const existingPrimaryOrgContact = existingOrgContacts.find(
            (oc) => oc.contactId === primaryContact.id && oc.rank === 1
          );

          if (!existingPrimaryOrgContact) {
            const primaryOrganizationContact = new OrganizationContact({
              contactId: primaryContact.id!,
              organizationId: finalUpdatedSchool.id!,
              organizationTypeId: 2,
              rank: 1,
              districtId: districtId,
            });
            await this.organizationContactRepository.createWithTransaction(
              prisma,
              primaryOrganizationContact
            );
          }
        }

        if (
          schoolData.overrideDistrictBilling &&
          schoolData.billingContact &&
          schoolData.billingEmail
        ) {
          const billingContactNames = schoolData.billingContact.split(' ');
          const billingFirstName = billingContactNames[0] || '';
          const billingLastName = billingContactNames.slice(1).join(' ') || '';

          let billingContact: Contact;
          let existingBillingContact: Contact | null = null;

          if (schoolData.billingEmail) {
            existingBillingContact = await this.contactRepository.findByEmail(
              schoolData.billingEmail
            );
          }

          if (existingBillingContact) {
            billingContact = existingBillingContact.update({
              firstName: billingFirstName,
              lastName: billingLastName,
              phone: schoolData.billingPhone,
              email: schoolData.billingEmail,
              address1: schoolData.billingAddressLine1,
              address2: schoolData.billingAddressLine2,
              city: schoolData.billingCity,
              state: schoolData.billingState,
              zipcode: schoolData.billingZipCode,
              contactType: ContactType.BILLING,
            });
            await this.contactRepository.updateWithTransaction(prisma, billingContact);
          } else {
            billingContact = new Contact({
              firstName: billingFirstName,
              lastName: billingLastName,
              phone: schoolData.billingPhone,
              email: schoolData.billingEmail,
              address1: schoolData.billingAddressLine1,
              address2: schoolData.billingAddressLine2,
              city: schoolData.billingCity,
              state: schoolData.billingState,
              zipcode: schoolData.billingZipCode,
              contactType: ContactType.BILLING,
              createdAt: new Date(),
            });
            billingContact = await this.contactRepository.createWithTransaction(
              prisma,
              billingContact
            );
          }

          const existingOrgContacts = await this.organizationContactRepository.findByOrganizationId(
            finalUpdatedSchool.id!
          );
          const existingBillingOrgContact = existingOrgContacts.find(
            (oc) => oc.contactId === billingContact.id && oc.rank === 2
          );

          if (!existingBillingOrgContact) {
            const billingOrganizationContact = new OrganizationContact({
              contactId: billingContact.id!,
              organizationId: finalUpdatedSchool.id!,
              organizationTypeId: 2,
              rank: 2,
              districtId: districtId,
            });
            await this.organizationContactRepository.createWithTransaction(
              prisma,
              billingOrganizationContact
            );
          }
        }

        return finalUpdatedSchool;
      });
      return result as School;
    } catch (error) {
      throw new BadRequestError(
        `Failed to update school: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async archiveSchool(districtId: number, schoolId: number, userId: number): Promise<void> {
    const user = await this.userRepository.getUserDetails(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const adminRoles = user.getAdminRoles();
    const hasRequiredRole = adminRoles.some(
      (role) =>
        role.role?.name === 'Group Admin' ||
        role.role?.name === 'District Admin' ||
        role.role?.name === 'School Admin'
    );

    if (!hasRequiredRole) {
      throw new ForbiddenError('User does not have required permissions');
    }

    const district = await this.userRepository.findDistrictById(districtId);
    if (!district) {
      throw new NotFoundError('District not found');
    }

    if (district.cooperativeId !== (user.cooperativeId || user.districtId)) {
      throw new ForbiddenError('District does not belong to your organization');
    }

    const existingSchool = await this.schoolRepository.findById(schoolId);
    if (!existingSchool) {
      throw new NotFoundError('School not found');
    }

    if (existingSchool.districtId !== districtId) {
      throw new ForbiddenError('School does not belong to the specified district');
    }

    if (existingSchool.isDeleted) {
      throw new NotFoundError('School has been deleted');
    }

    existingSchool.markAsInactive();

    const updatedSchool = await this.schoolRepository.update(existingSchool);
    if (!updatedSchool) {
      throw new BadRequestError('Failed to archive school');
    }
  }

  async activateSchool(districtId: number, schoolId: number, userId: number): Promise<void> {
    const user = await this.userRepository.getUserDetails(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const adminRoles = user.getAdminRoles();
    const hasRequiredRole = adminRoles.some(
      (role) =>
        role.role?.name === 'Group Admin' ||
        role.role?.name === 'District Admin' ||
        role.role?.name === 'School Admin'
    );

    if (!hasRequiredRole) {
      throw new ForbiddenError('User does not have required permissions');
    }

    const district = await this.userRepository.findDistrictById(districtId);
    if (!district) {
      throw new NotFoundError('District not found');
    }

    if (district.cooperativeId !== (user.cooperativeId || user.districtId)) {
      throw new ForbiddenError('District does not belong to your organization');
    }

    const existingSchool = await this.schoolRepository.findById(schoolId);
    if (!existingSchool) {
      throw new NotFoundError('School not found');
    }

    if (existingSchool.districtId !== districtId) {
      throw new ForbiddenError('School does not belong to the specified district');
    }

    if (existingSchool.isDeleted) {
      throw new NotFoundError('School has been deleted');
    }

    existingSchool.markAsActive();

    const updatedSchool = await this.schoolRepository.update(existingSchool);
    if (!updatedSchool) {
      throw new BadRequestError('Failed to activate school');
    }
  }

  async deleteSchool(districtId: number, schoolId: number, userId: number): Promise<void> {
    const user = await this.userRepository.getUserDetails(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const adminRoles = user.getAdminRoles();
    const hasRequiredRole = adminRoles.some(
      (role) =>
        role.role?.name === 'Group Admin' ||
        role.role?.name === 'District Admin' ||
        role.role?.name === 'School Admin'
    );

    if (!hasRequiredRole) {
      throw new ForbiddenError('User does not have required permissions');
    }

    const district = await this.userRepository.findDistrictById(districtId);
    if (!district) {
      throw new NotFoundError('District not found');
    }

    if (district.cooperativeId !== (user.cooperativeId || user.districtId)) {
      throw new ForbiddenError('District does not belong to your organization');
    }

    const existingSchool = await this.schoolRepository.findById(schoolId);
    if (!existingSchool) {
      throw new NotFoundError('School not found');
    }

    if (existingSchool.districtId !== districtId) {
      throw new ForbiddenError('School does not belong to the specified district');
    }

    if (existingSchool.isDeleted) {
      throw new NotFoundError('School has been deleted');
    }

    await this.schoolRepository.softDelete(schoolId);
  }

  async getSchoolById(districtId: number, schoolId: number, userId: number): Promise<School> {
    const user = await this.userRepository.getUserDetails(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const adminRoles = user.getAdminRoles();
    const hasRequiredRole = adminRoles.some(
      (role) =>
        role.role?.name === 'Group Admin' ||
        role.role?.name === 'District Admin' ||
        role.role?.name === 'School Admin' ||
        role.role?.name === 'Viewer'
    );

    if (!hasRequiredRole) {
      throw new ForbiddenError('User does not have required permissions');
    }

    const district = await this.userRepository.findDistrictById(districtId);
    if (!district) {
      throw new NotFoundError('District not found');
    }

    if (district.cooperativeId !== (user.cooperativeId || user.districtId)) {
      throw new ForbiddenError('District does not belong to your organization');
    }

    const school = await this.schoolRepository.findById(schoolId);
    if (!school) {
      throw new NotFoundError('School not found');
    }

    if (school.districtId !== districtId) {
      throw new ForbiddenError('School does not belong to the specified district');
    }

    if (school.isDeleted) {
      throw new NotFoundError('School has been deleted');
    }

    return school;
  }

  async getSchoolDetails(districtId: number, schoolId: number): Promise<GetSchoolDetailsResponse> {
    const school = await this.schoolRepository.findById(schoolId);
    if (!school) {
      throw new NotFoundError('School not found');
    }

    if (school.districtId !== districtId) {
      throw new ForbiddenError('School does not belong to the specified district');
    }

    if (school.isDeleted) {
      throw new NotFoundError('School has been deleted');
    }

    const districtDetails = await this.districtRepository.findByIds(districtId);
    if (!districtDetails) {
      throw new NotFoundError('District details not found');
    }

    const organizationContacts =
      await this.organizationContactRepository.findByOrganizationId(schoolId);

    const primaryContact = organizationContacts.find((oc) => oc.rank === 1)?.contact;
    const billingContact = organizationContacts.find((oc) => oc.rank === 2)?.contact;

    const response: GetSchoolDetailsResponse = {
      id: school.id!,
      districtId: school.districtId,
      districtName: districtDetails.name,
      name: school.name,
      enrollment: school.enrollment,
      schoolType: school.schoolType,
      addressLine1: school.addressLine1,
      addressLine2: school.addressLine2,
      city: school.city,
      state: school.state,
      zipCode: school.zipCode,
      shippingAddressLine1: school.shippingAddressLine1,
      shippingAddressLine2: school.shippingAddressLine2,
      shippingAddressCity: school.shippingAddressCity,
      shippingAddressState: school.shippingAddressState,
      shippingAddressZipCode: school.shippingAddressZipCode,
      notes: school.notes,
      contactFirstName: primaryContact?.firstName,
      contactLastName: primaryContact?.lastName,
      contactTitle: primaryContact?.title,
      contactPhone: primaryContact?.phone,
      contactEmail: primaryContact?.email,
      billingContact: billingContact
        ? `${billingContact.firstName} ${billingContact.lastName}`
        : undefined,
      billingPhone: billingContact?.phone,
      billingEmail: billingContact?.email,
      billingAddressLine1: billingContact?.address1,
      billingAddressLine2: billingContact?.address2,
      billingCity: billingContact?.city,
      billingState: billingContact?.state,
      billingZipCode: billingContact?.zipcode,
      fax: school.fax,
      shippingInstructions: school.shippingInstructions,
      shippingDeliveryHours: school.shippingDeliveryHours,
    };

    return response;
  }
}
