import { Invitation } from './Invitation';
import { PrismaClient } from '@prisma/client';

export interface IInvitationRepository {
  create(invitation: Invitation): Promise<Invitation>;
  createWithTransaction(prisma: PrismaClient, invitation: Invitation): Promise<Invitation>;
  findByEmail(email: string): Promise<Invitation | null>;
  findById(id: number): Promise<Invitation | null>;
  findByToken(token: string): Promise<Invitation | null>;
  update(invitation: Invitation): Promise<Invitation>;
}
