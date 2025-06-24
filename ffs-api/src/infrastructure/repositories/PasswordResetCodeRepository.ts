import { PrismaClient } from '@prisma/client';
import { IPasswordResetCodeRepository } from '../../domain/interfaces/passwordResetCodes/IPasswordResetCodeRepository';
import { PasswordResetCode } from '../../domain/interfaces/passwordResetCodes/PasswordResetCode';
import TYPES from '../../shared/dependencyInjection/types';
import { inject } from 'inversify';
import { IDatabaseService } from '../../application/contracts/IDatabaseService';
import { PasswordResetCodeMapper } from '../mappers/PasswordResetCodeMapper';

export class PasswordResetCodeRepository
  implements IPasswordResetCodeRepository {
  private pasRestCodesModel: PrismaClient['passwordResetCode'];

  constructor(@inject(TYPES.IDatabaseService) database: IDatabaseService) {
    const prismaClient = database.getClient();
    this.pasRestCodesModel = prismaClient.passwordResetCode;
  }
  
  async findByUserIdAndCode(
    userId: number,
    code: string
  ): Promise<PasswordResetCode | null> {
    const passwordResetCode = await this.pasRestCodesModel.findFirst({
      where: {
        userId: userId,
        code: code,
      },
    });

    return passwordResetCode ? new PasswordResetCode(passwordResetCode) : null;
  }

  async markAsUsed(codeId: number): Promise<void> {
    await this.pasRestCodesModel.update({
      where: { id: codeId },
      data: { used: true },
    });
  }

  async create(entity: PasswordResetCode): Promise<PasswordResetCode> {
    const data = PasswordResetCodeMapper.toPrisma(entity);
  
    const createdDataObject = await this.pasRestCodesModel.create({ data });
  
    return new PasswordResetCode(createdDataObject);
  }

  async update(entity: PasswordResetCode): Promise<PasswordResetCode> {
    const data = PasswordResetCodeMapper.toPrisma(entity);
        
    const dataObject = await this.pasRestCodesModel.update({
      where: { id: entity.id },
      data: data
    });
        
    return new PasswordResetCode(dataObject);
  }
}
