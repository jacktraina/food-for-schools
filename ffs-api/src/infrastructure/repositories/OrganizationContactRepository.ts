import { inject, injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { OrganizationContact } from '../../domain/interfaces/OrganizationContacts/OrganizationContact';
import { IOrganizationContactRepository } from '../../domain/interfaces/OrganizationContacts/IOrganizationContactRepository';
import { Contact } from '../../domain/interfaces/Contacts/Contact';
import { District } from '../../domain/interfaces/Districts/District';
import { OrganizationType } from '../../domain/interfaces/organizationTypes/OrganizationType';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';
import TYPES from '../../shared/dependencyInjection/types';

@injectable()
export class OrganizationContactRepository implements IOrganizationContactRepository {
  private prisma: PrismaClient;

  constructor(@inject(TYPES.IDatabaseService) database: IDatabaseService) {
    this.prisma = database.getClient();
  }

  async create(organizationContact: OrganizationContact): Promise<OrganizationContact> {
    const createdOrganizationContact = await this.prisma.organizationContacts.create({
      data: {
        contactId: organizationContact.contactId,
        organizationId: organizationContact.organizationId,
        organizationTypeId: organizationContact.organizationTypeId,
        rank: organizationContact.rank,
        districtId: organizationContact.districtId,
      },
      include: {
        contact: true,
        district: true,
        organizationType: true,
      },
    });

    return new OrganizationContact({
      id: createdOrganizationContact.id,
      contactId: createdOrganizationContact.contactId,
      organizationId: createdOrganizationContact.organizationId,
      organizationTypeId: createdOrganizationContact.organizationTypeId,
      rank: createdOrganizationContact.rank,
      districtId: createdOrganizationContact.districtId ?? undefined,
      contact: createdOrganizationContact.contact ? new Contact({
        ...createdOrganizationContact.contact,
        contactType: createdOrganizationContact.contact.contactType
      }) : undefined,
      district: createdOrganizationContact.district ? new District({
        ...createdOrganizationContact.district,
        annualBudget: createdOrganizationContact.district.annualBudget 
          ? (typeof createdOrganizationContact.district.annualBudget === 'object' && 'toNumber' in createdOrganizationContact.district.annualBudget 
             ? createdOrganizationContact.district.annualBudget.toNumber() 
             : Number(createdOrganizationContact.district.annualBudget))
          : null,
        updatedAt: createdOrganizationContact.district.updatedAt || new Date()
      }) : undefined,
      organizationType: createdOrganizationContact.organizationType ? new OrganizationType(createdOrganizationContact.organizationType) : undefined,
    });
  }

  async findById(id: number): Promise<OrganizationContact | null> {
    const organizationContact = await this.prisma.organizationContacts.findUnique({
      where: { id },
      include: {
        contact: true,
        district: true,
        organizationType: true,
      },
    });

    if (!organizationContact) {
      return null;
    }

    return new OrganizationContact({
      id: organizationContact.id,
      contactId: organizationContact.contactId,
      organizationId: organizationContact.organizationId,
      organizationTypeId: organizationContact.organizationTypeId,
      rank: organizationContact.rank,
      districtId: organizationContact.districtId ?? undefined,
      contact: organizationContact.contact ? new Contact({
        ...organizationContact.contact,
        contactType: organizationContact.contact.contactType
      }) : undefined,
      district: organizationContact.district ? new District({
        ...organizationContact.district,
        annualBudget: organizationContact.district.annualBudget 
          ? (typeof organizationContact.district.annualBudget === 'object' && 'toNumber' in organizationContact.district.annualBudget 
             ? organizationContact.district.annualBudget.toNumber() 
             : Number(organizationContact.district.annualBudget))
          : null,
        updatedAt: organizationContact.district.updatedAt || new Date()
      }) : undefined,
      organizationType: organizationContact.organizationType ? new OrganizationType(organizationContact.organizationType) : undefined,
    });
  }

  async findByOrganizationId(organizationId: number): Promise<OrganizationContact[]> {
    const organizationContacts = await this.prisma.organizationContacts.findMany({
      where: { organizationId },
      include: {
        contact: true,
        district: true,
        organizationType: true,
      },
    });

    return organizationContacts.map(organizationContact => new OrganizationContact({
      id: organizationContact.id,
      contactId: organizationContact.contactId,
      organizationId: organizationContact.organizationId,
      organizationTypeId: organizationContact.organizationTypeId,
      rank: organizationContact.rank,
      districtId: organizationContact.districtId ?? undefined,
      contact: organizationContact.contact ? new Contact({
        ...organizationContact.contact,
        contactType: organizationContact.contact.contactType
      }) : undefined,
      district: organizationContact.district ? new District({
        ...organizationContact.district,
        annualBudget: organizationContact.district.annualBudget 
          ? (typeof organizationContact.district.annualBudget === 'object' && 'toNumber' in organizationContact.district.annualBudget 
             ? organizationContact.district.annualBudget.toNumber() 
             : Number(organizationContact.district.annualBudget))
          : null,
        updatedAt: organizationContact.district.updatedAt || new Date()
      }) : undefined,
      organizationType: organizationContact.organizationType ? new OrganizationType(organizationContact.organizationType) : undefined,
    }));
  }

  async findByContactId(contactId: number): Promise<OrganizationContact[]> {
    const organizationContacts = await this.prisma.organizationContacts.findMany({
      where: { contactId },
      include: {
        contact: true,
        district: true,
        organizationType: true,
      },
    });

    return organizationContacts.map(organizationContact => new OrganizationContact({
      id: organizationContact.id,
      contactId: organizationContact.contactId,
      organizationId: organizationContact.organizationId,
      organizationTypeId: organizationContact.organizationTypeId,
      rank: organizationContact.rank,
      districtId: organizationContact.districtId ?? undefined,
      contact: organizationContact.contact ? new Contact({
        ...organizationContact.contact,
        contactType: organizationContact.contact.contactType
      }) : undefined,
      district: organizationContact.district ? new District({
        ...organizationContact.district,
        annualBudget: organizationContact.district.annualBudget 
          ? (typeof organizationContact.district.annualBudget === 'object' && 'toNumber' in organizationContact.district.annualBudget 
             ? organizationContact.district.annualBudget.toNumber() 
             : Number(organizationContact.district.annualBudget))
          : null,
        updatedAt: organizationContact.district.updatedAt || new Date()
      }) : undefined,
      organizationType: organizationContact.organizationType ? new OrganizationType(organizationContact.organizationType) : undefined,
    }));
  }

  async findAll(): Promise<OrganizationContact[]> {
    const organizationContacts = await this.prisma.organizationContacts.findMany({
      include: {
        contact: true,
        district: true,
        organizationType: true,
      },
    });

    return organizationContacts.map(organizationContact => new OrganizationContact({
      id: organizationContact.id,
      contactId: organizationContact.contactId,
      organizationId: organizationContact.organizationId,
      organizationTypeId: organizationContact.organizationTypeId,
      rank: organizationContact.rank,
      districtId: organizationContact.districtId ?? undefined,
      contact: organizationContact.contact ? new Contact({
        ...organizationContact.contact,
        contactType: organizationContact.contact.contactType
      }) : undefined,
      district: organizationContact.district ? new District({
        ...organizationContact.district,
        annualBudget: organizationContact.district.annualBudget 
          ? (typeof organizationContact.district.annualBudget === 'object' && 'toNumber' in organizationContact.district.annualBudget 
             ? organizationContact.district.annualBudget.toNumber() 
             : Number(organizationContact.district.annualBudget))
          : null,
        updatedAt: organizationContact.district.updatedAt || new Date()
      }) : undefined,
      organizationType: organizationContact.organizationType ? new OrganizationType(organizationContact.organizationType) : undefined,
    }));
  }

  async update(organizationContact: OrganizationContact): Promise<OrganizationContact> {
    const updatedOrganizationContact = await this.prisma.organizationContacts.update({
      where: { id: organizationContact.id },
      data: {
        contactId: organizationContact.contactId,
        organizationId: organizationContact.organizationId,
        organizationTypeId: organizationContact.organizationTypeId,
        rank: organizationContact.rank,
        districtId: organizationContact.districtId,
      },
      include: {
        contact: true,
        district: true,
        organizationType: true,
      },
    });

    return new OrganizationContact({
      id: updatedOrganizationContact.id,
      contactId: updatedOrganizationContact.contactId,
      organizationId: updatedOrganizationContact.organizationId,
      organizationTypeId: updatedOrganizationContact.organizationTypeId,
      rank: updatedOrganizationContact.rank,
      districtId: updatedOrganizationContact.districtId ?? undefined,
      contact: updatedOrganizationContact.contact ? new Contact({
        ...updatedOrganizationContact.contact,
        contactType: updatedOrganizationContact.contact.contactType
      }) : undefined,
      district: updatedOrganizationContact.district ? new District({
        ...updatedOrganizationContact.district,
        annualBudget: updatedOrganizationContact.district.annualBudget 
          ? (typeof updatedOrganizationContact.district.annualBudget === 'object' && 'toNumber' in updatedOrganizationContact.district.annualBudget 
             ? updatedOrganizationContact.district.annualBudget.toNumber() 
             : Number(updatedOrganizationContact.district.annualBudget))
          : null,
        updatedAt: updatedOrganizationContact.district.updatedAt || new Date()
      }) : undefined,
      organizationType: updatedOrganizationContact.organizationType ? new OrganizationType(updatedOrganizationContact.organizationType) : undefined,
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.organizationContacts.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async createWithTransaction(prisma: PrismaClient, organizationContact: OrganizationContact): Promise<OrganizationContact> {
    const createdOrganizationContact = await prisma.organizationContacts.create({
      data: {
        contactId: organizationContact.contactId,
        organizationId: organizationContact.organizationId,
        organizationTypeId: organizationContact.organizationTypeId,
        rank: organizationContact.rank,
        districtId: organizationContact.districtId,
      },
      include: {
        contact: true,
        district: true,
        organizationType: true,
      },
    });

    return new OrganizationContact({
      id: createdOrganizationContact.id,
      contactId: createdOrganizationContact.contactId,
      organizationId: createdOrganizationContact.organizationId,
      organizationTypeId: createdOrganizationContact.organizationTypeId,
      rank: createdOrganizationContact.rank,
      districtId: createdOrganizationContact.districtId ?? undefined,
      contact: createdOrganizationContact.contact ? new Contact({
        ...createdOrganizationContact.contact,
        contactType: createdOrganizationContact.contact.contactType
      }) : undefined,
      district: createdOrganizationContact.district ? new District({
        ...createdOrganizationContact.district,
        annualBudget: createdOrganizationContact.district.annualBudget 
          ? (typeof createdOrganizationContact.district.annualBudget === 'object' && 'toNumber' in createdOrganizationContact.district.annualBudget 
             ? createdOrganizationContact.district.annualBudget.toNumber() 
             : Number(createdOrganizationContact.district.annualBudget))
          : null,
        updatedAt: createdOrganizationContact.district.updatedAt || new Date()
      }) : undefined,
      organizationType: createdOrganizationContact.organizationType ? new OrganizationType(createdOrganizationContact.organizationType) : undefined,
    });
  }
}
