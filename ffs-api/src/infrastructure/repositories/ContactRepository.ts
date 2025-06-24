import { inject, injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { Contact, ContactType } from '../../domain/interfaces/Contacts/Contact';
import { IContactRepository } from '../../domain/interfaces/Contacts/IContactRepository';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';
import TYPES from '../../shared/dependencyInjection/types';

@injectable()
export class ContactRepository implements IContactRepository {
  private prisma: PrismaClient;

  constructor(@inject(TYPES.IDatabaseService) database: IDatabaseService) {
    this.prisma = database.getClient();
  }

  async create(contact: Contact): Promise<Contact> {
    const createdContact = await this.prisma.contacts.create({
      data: {
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        address1: contact.address1,
        address2: contact.address2,
        city: contact.city,
        state: contact.state,
        zipcode: contact.zipcode,
        contactType: contact.contactType as ContactType,
        email: contact.email,
      },
    });

    return new Contact({
      id: createdContact.id,
      firstName: createdContact.firstName,
      lastName: createdContact.lastName,
      phone: createdContact.phone ?? undefined,
      address1: createdContact.address1 ?? undefined,
      address2: createdContact.address2 ?? undefined,
      city: createdContact.city ?? undefined,
      state: createdContact.state ?? undefined,
      zipcode: createdContact.zipcode ?? undefined,
      contactType: createdContact.contactType as ContactType,
      email: createdContact.email ?? undefined,
      createdAt: createdContact.createdAt,
      updatedAt: createdContact.updatedAt,
    });
  }

  async findById(id: number): Promise<Contact | null> {
    const contact = await this.prisma.contacts.findUnique({
      where: { id },
    });

    if (!contact) {
      return null;
    }

    return new Contact({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone ?? undefined,
      address1: contact.address1 ?? undefined,
      address2: contact.address2 ?? undefined,
      city: contact.city ?? undefined,
      state: contact.state ?? undefined,
      zipcode: contact.zipcode ?? undefined,
      contactType: contact.contactType as ContactType,
      email: contact.email ?? undefined,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<Contact | null> {
    const contact = await this.prisma.contacts.findFirst({
      where: { email },
    });

    if (!contact) {
      return null;
    }

    return new Contact({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone ?? undefined,
      address1: contact.address1 ?? undefined,
      address2: contact.address2 ?? undefined,
      city: contact.city ?? undefined,
      state: contact.state ?? undefined,
      zipcode: contact.zipcode ?? undefined,
      contactType: contact.contactType as ContactType,
      email: contact.email ?? undefined,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    });
  }

  async findAll(): Promise<Contact[]> {
    const contacts = await this.prisma.contacts.findMany();

    return contacts.map(contact => new Contact({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone ?? undefined,
      address1: contact.address1 ?? undefined,
      address2: contact.address2 ?? undefined,
      city: contact.city ?? undefined,
      state: contact.state ?? undefined,
      zipcode: contact.zipcode ?? undefined,
      contactType: contact.contactType as ContactType,
      email: contact.email ?? undefined,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    }));
  }

  async update(contact: Contact): Promise<Contact> {
    const updatedContact = await this.prisma.contacts.update({
      where: { id: contact.id },
      data: {
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        address1: contact.address1,
        address2: contact.address2,
        city: contact.city,
        state: contact.state,
        zipcode: contact.zipcode,
        contactType: contact.contactType as ContactType,
        email: contact.email,
      },
    });

    return new Contact({
      id: updatedContact.id,
      firstName: updatedContact.firstName,
      lastName: updatedContact.lastName,
      phone: updatedContact.phone ?? undefined,
      address1: updatedContact.address1 ?? undefined,
      address2: updatedContact.address2 ?? undefined,
      city: updatedContact.city ?? undefined,
      state: updatedContact.state ?? undefined,
      zipcode: updatedContact.zipcode ?? undefined,
      contactType: updatedContact.contactType as ContactType,
      email: updatedContact.email ?? undefined,
      createdAt: updatedContact.createdAt,
      updatedAt: updatedContact.updatedAt,
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.contacts.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async createWithTransaction(prisma: PrismaClient, contact: Contact): Promise<Contact> {
    const createdContact = await prisma.contacts.create({
      data: {
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        address1: contact.address1,
        address2: contact.address2,
        city: contact.city,
        state: contact.state,
        zipcode: contact.zipcode,
        contactType: contact.contactType as ContactType,
        email: contact.email,
      },
    });

    return new Contact({
      id: createdContact.id,
      firstName: createdContact.firstName,
      lastName: createdContact.lastName,
      phone: createdContact.phone ?? undefined,
      address1: createdContact.address1 ?? undefined,
      address2: createdContact.address2 ?? undefined,
      city: createdContact.city ?? undefined,
      state: createdContact.state ?? undefined,
      zipcode: createdContact.zipcode ?? undefined,
      contactType: createdContact.contactType as ContactType,
      email: createdContact.email ?? undefined,
      createdAt: createdContact.createdAt,
      updatedAt: createdContact.updatedAt,
    });
  }

  async updateWithTransaction(prisma: PrismaClient, contact: Contact): Promise<Contact> {
    if (!contact.id) {
      throw new Error('Contact ID is required for update');
    }

    const updatedContact = await prisma.contacts.update({
      where: { id: contact.id },
      data: {
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        address1: contact.address1,
        address2: contact.address2,
        city: contact.city,
        state: contact.state,
        zipcode: contact.zipcode,
        contactType: contact.contactType as ContactType,
        email: contact.email,
        title: contact.title,
        updatedAt: new Date(),
      },
    });

    return new Contact({
      id: updatedContact.id,
      firstName: updatedContact.firstName,
      lastName: updatedContact.lastName,
      phone: updatedContact.phone ?? undefined,
      address1: updatedContact.address1 ?? undefined,
      address2: updatedContact.address2 ?? undefined,
      city: updatedContact.city ?? undefined,
      state: updatedContact.state ?? undefined,
      zipcode: updatedContact.zipcode ?? undefined,
      contactType: updatedContact.contactType as ContactType,
      email: updatedContact.email ?? undefined,
      title: updatedContact.title ?? undefined,
      createdAt: updatedContact.createdAt,
      updatedAt: updatedContact.updatedAt,
    });
  }
}
