import { Contact } from './Contact';
import { PrismaClient } from '@prisma/client';

export interface IContactRepository {
  create(contact: Contact): Promise<Contact>;
  createWithTransaction(prisma: PrismaClient, contact: Contact): Promise<Contact>;
  updateWithTransaction(prisma: PrismaClient, contact: Contact): Promise<Contact>;
  findById(id: number): Promise<Contact | null>;
  findByEmail(email: string): Promise<Contact | null>;
  findAll(): Promise<Contact[]>;
  update(contact: Contact): Promise<Contact>;
  delete(id: number): Promise<boolean>;
}
