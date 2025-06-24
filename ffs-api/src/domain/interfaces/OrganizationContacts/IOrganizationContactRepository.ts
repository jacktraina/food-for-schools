import { OrganizationContact } from './OrganizationContact';
import { PrismaClient } from '@prisma/client';

export interface IOrganizationContactRepository {
  create(organizationContact: OrganizationContact): Promise<OrganizationContact>;
  createWithTransaction(prisma: PrismaClient, organizationContact: OrganizationContact): Promise<OrganizationContact>;
  findById(id: number): Promise<OrganizationContact | null>;
  findByOrganizationId(organizationId: number): Promise<OrganizationContact[]>;
  findByContactId(contactId: number): Promise<OrganizationContact[]>;
  findAll(): Promise<OrganizationContact[]>;
  update(organizationContact: OrganizationContact): Promise<OrganizationContact>;
  delete(id: number): Promise<boolean>;
}
