import { PrismaClient } from "@prisma/client";
import { EmailVerificationCode } from "./EmailVerificationCode";

export interface IEmailVerificationCodeRepository {
  create(entity: EmailVerificationCode): Promise<EmailVerificationCode>;
  findByUserIdAndCode(userId: number, code: string): Promise<EmailVerificationCode | null>;
  markAsUsed(codeId: number): Promise<void>;
  createWithTransaction(prisma: PrismaClient,
    data: {
      userId: number;
      code: string;
      expiresAt: Date;
    }): Promise<EmailVerificationCode>;
  update(entity: EmailVerificationCode): Promise<EmailVerificationCode>;
}
