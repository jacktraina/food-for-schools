import { inject } from 'inversify';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';
import TYPES from '../../shared/dependencyInjection/types';
import { PrismaClient } from '@prisma/client';
import { IEmailVerificationCodeRepository } from '../../domain/interfaces/emailVerificationCodes/IEmailVerificationCodeRepository';
import { EmailVerificationCode } from '../../domain/interfaces/emailVerificationCodes/EmailVerificationCode';
import { EmailVerificationMapper } from '../mappers/EmailVerificationMapper';

export class EmailVerificationCodeRepository implements IEmailVerificationCodeRepository {
  private evcModel: PrismaClient['emailVerificationCode'];

  constructor(@inject(TYPES.IDatabaseService) database: IDatabaseService) {
    const prismaClient = database.getClient();
    this.evcModel = prismaClient.emailVerificationCode;
  }

  async create(entity: EmailVerificationCode): Promise<EmailVerificationCode> {
    const data = EmailVerificationMapper.toPrisma(entity);

    const createdDataObject = await this.evcModel.create({ data });

    return new EmailVerificationCode(createdDataObject);
  }

  async findByUserIdAndCode(
    userId: number,
    code: string
  ): Promise<EmailVerificationCode | null> {
    const emailVerificationCode = await this.evcModel.findFirst({
      where: {
        userId: userId,
        code: code,
      },
    });

    return emailVerificationCode ? new EmailVerificationCode(emailVerificationCode) : null;
  }

  async markAsUsed(codeId: number): Promise<void> {
    await this.evcModel.update({
      where: { id: codeId },
      data: { used: true },
    });
  }

  async update(entity: EmailVerificationCode): Promise<EmailVerificationCode> {
    const data = EmailVerificationMapper.toPrisma(entity);
          
    const dataObject = await this.evcModel.update({
      where: { id: entity.id },
      data: data
    });
          
    return new EmailVerificationCode(dataObject);
  }

  async createWithTransaction(prisma: PrismaClient,
    data: {
    userId: number;
    code: string;
    expiresAt: Date;
  }): Promise<EmailVerificationCode> {
    const createdData = await prisma.emailVerificationCode.create({
      data: {
        userId: data.userId,
        code: data.code,
        expiresAt: data.expiresAt,
      },
    });

    return new EmailVerificationCode(createdData);
  }
}
