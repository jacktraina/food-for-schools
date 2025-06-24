import { PasswordResetCode } from './PasswordResetCode';

export interface IPasswordResetCodeRepository {
  findByUserIdAndCode(
    userId: number,
    code: string
  ): Promise<PasswordResetCode | null>;
  markAsUsed(codeId: number): Promise<void>;
  create(data: {
    userId: number;
    code: string;
    expiresAt: Date;
  }): Promise<PasswordResetCode>;
  create(entity: PasswordResetCode): Promise<PasswordResetCode>;
  update(entity: PasswordResetCode): Promise<PasswordResetCode>;
}
