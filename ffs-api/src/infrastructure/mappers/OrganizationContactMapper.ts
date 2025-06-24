import { OrganizationContact } from '../../domain/interfaces/OrganizationContacts/OrganizationContact';
import { District } from '../../domain/interfaces/Districts/District';
import { OrganizationType } from '../../domain/interfaces/organizationTypes/OrganizationType';
import { ContactMapper } from './ContactMapper';

export class OrganizationContactMapper {
  static toPrisma(entity: OrganizationContact) {
    return {
      id: entity.id,
      contactId: entity.contactId,
      organizationId: entity.organizationId,
      organizationTypeId: entity.organizationTypeId,
      rank: entity.rank,
      districtId: entity.districtId,
    };
  }

  static toDomain(prismaModel: {
    id: number;
    contactId: number;
    organizationId: number;
    organizationTypeId: number;
    rank: number;
    districtId: number | null;
    contact?: {
      id: number;
      firstName: string;
      lastName: string;
      phone: string | null;
      address1: string | null;
      address2: string | null;
      city: string | null;
      state: string | null;
      zipcode: string | null;
      contactType: string;
      email: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    district?: {
      id: number;
      code: string;
      name: string;
      userStatusId: number;
    };
    organizationType?: {
      id: number;
      name: string;
    };
  }): OrganizationContact {
    return new OrganizationContact({
      id: prismaModel.id,
      contactId: prismaModel.contactId,
      organizationId: prismaModel.organizationId,
      organizationTypeId: prismaModel.organizationTypeId,
      rank: prismaModel.rank,
      districtId: prismaModel.districtId ?? undefined,
      contact: prismaModel.contact ? ContactMapper.toDomain(prismaModel.contact) : undefined,
      district: prismaModel.district ? new District({
        id: prismaModel.district.id,
        code: prismaModel.district.code,
        name: prismaModel.district.name,
        statusId: prismaModel.district.userStatusId,
      }) : undefined,
      organizationType: prismaModel.organizationType ? new OrganizationType({
        id: prismaModel.organizationType.id,
        name: prismaModel.organizationType.name,
      }) : undefined,
    });
  }
}
