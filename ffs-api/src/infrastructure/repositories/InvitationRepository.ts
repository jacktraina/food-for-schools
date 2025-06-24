import { inject, injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { Invitation } from '../../domain/interfaces/invitations/Invitation';
import { IInvitationRepository } from '../../domain/interfaces/invitations/IInvitationRepository';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';
import TYPES from '../../shared/dependencyInjection/types';

@injectable()
export class InvitationRepository implements IInvitationRepository {
  private prisma: PrismaClient;

  constructor(@inject(TYPES.IDatabaseService) databaseService: IDatabaseService) {
    this.prisma = databaseService.getClient();
  }

  async create(invitation: Invitation): Promise<Invitation> {
    try {
      const createdInvitation = await this.prisma.invitation.create({
        data: {
          email: invitation.email,
          cooperativeId: invitation.cooperativeId,
          districtId: invitation.districtId,
          invitedBy: invitation.invitedBy,
          statusId: invitation.statusId,
          expirationDate: invitation.expirationDate,
          invitedRoleId: invitation.invitedRoleId,
          token: invitation.token,
        },

      });

      return new Invitation({
        id: createdInvitation.id,
        email: createdInvitation.email,
        cooperativeId: createdInvitation.cooperativeId,
        districtId: createdInvitation.districtId,
        invitedBy: createdInvitation.invitedBy,
        statusId: createdInvitation.statusId,
        createdAt: createdInvitation.createdAt,
        expirationDate: createdInvitation.expirationDate,
        invitedRoleId: createdInvitation.invitedRoleId,
        token: createdInvitation.token,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new Error('An invitation with this email and district already exists or token is already used');
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Invitation | null> {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        email: email,
      },

    });

    if (!invitation) {
      return null;
    }

    return new Invitation({
      id: invitation.id,
      email: invitation.email,
      cooperativeId: invitation.cooperativeId,
      districtId: invitation.districtId,
      invitedBy: invitation.invitedBy,
      statusId: invitation.statusId,
      createdAt: invitation.createdAt,
      expirationDate: invitation.expirationDate,
      invitedRoleId: invitation.invitedRoleId,
      token: invitation.token,
    });
  }

  async findById(id: number): Promise<Invitation | null> {
    const invitation = await this.prisma.invitation.findUnique({
      where: {
        id: id,
      },

    });

    if (!invitation) {
      return null;
    }

    return new Invitation({
      id: invitation.id,
      email: invitation.email,
      cooperativeId: invitation.cooperativeId,
      districtId: invitation.districtId,
      invitedBy: invitation.invitedBy,
      statusId: invitation.statusId,
      createdAt: invitation.createdAt,
      expirationDate: invitation.expirationDate,
      invitedRoleId: invitation.invitedRoleId,
      token: invitation.token,
    });
  }

  async update(invitation: Invitation): Promise<Invitation> {
    const updatedInvitation = await this.prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        email: invitation.email,
        invitedBy: invitation.invitedBy,
        statusId: invitation.statusId,
        expirationDate: invitation.expirationDate,
        invitedRoleId: invitation.invitedRoleId,
        token: invitation.token,
      },

    });

    return new Invitation({
      id: updatedInvitation.id,
      email: updatedInvitation.email,
      cooperativeId: invitation.cooperativeId,
      districtId: invitation.districtId,
      invitedBy: updatedInvitation.invitedBy,
      statusId: updatedInvitation.statusId,
      createdAt: updatedInvitation.createdAt,
      expirationDate: updatedInvitation.expirationDate,
      invitedRoleId: updatedInvitation.invitedRoleId,
      token: updatedInvitation.token,
    });
  }

  async createWithTransaction(prisma: PrismaClient, invitation: Invitation): Promise<Invitation> {
    try {
      const createdInvitation = await prisma.invitation.create({
        data: {
          email: invitation.email,
          cooperativeId: invitation.cooperativeId,
          districtId: invitation.districtId,
          invitedBy: invitation.invitedBy,
          statusId: invitation.statusId,
          expirationDate: invitation.expirationDate,
          invitedRoleId: invitation.invitedRoleId,
          token: invitation.token,
        },

      });

      return new Invitation({
        id: createdInvitation.id,
        email: createdInvitation.email,
        cooperativeId: createdInvitation.cooperativeId,
        districtId: createdInvitation.districtId,
        invitedBy: createdInvitation.invitedBy,
        statusId: createdInvitation.statusId,
        createdAt: createdInvitation.createdAt,
        expirationDate: createdInvitation.expirationDate,
        invitedRoleId: createdInvitation.invitedRoleId,
        token: createdInvitation.token,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new Error('An invitation with this email and district already exists or token is already used');
      }
      throw error;
    }
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        token: token,
      },

    });

    if (!invitation) {
      return null;
    }

    return new Invitation({
      id: invitation.id,
      email: invitation.email,
      cooperativeId: invitation.cooperativeId,
      districtId: invitation.districtId,
      invitedBy: invitation.invitedBy,
      statusId: invitation.statusId,
      createdAt: invitation.createdAt,
      expirationDate: invitation.expirationDate,
      invitedRoleId: invitation.invitedRoleId,
      token: invitation.token,
    });
  }
}
