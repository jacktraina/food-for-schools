
import { Prisma } from "@prisma/client"; // adjust path if needed
import { EmailVerificationCode } from "../../domain/interfaces/emailVerificationCodes/EmailVerificationCode";

export class EmailVerificationMapper {
  /**
   * Maps domain object to Prisma create input (excludes auto-generated `id`)
   */
  static toPrisma(entity: EmailVerificationCode): Prisma.EmailVerificationCodeCreateInput {
    return {
      code: entity.code,
      expiresAt: entity.expiresAt,
      used: entity.used,
      createdAt: entity.createdAt,
      isDeleted: entity.isDeleted,
      user: {
        connect: {
          id: entity.userId,
        },
      },
    };
  }

  /**
   * Maps Prisma DB object to domain object
   */
  static toDomain(prismaModel: Prisma.EmailVerificationCodeUncheckedCreateInput): EmailVerificationCode {
    return new EmailVerificationCode({
      id: prismaModel.id ?? -1, // fallback if undefined
      userId: prismaModel.userId,
      code: prismaModel.code,
      expiresAt: new Date(prismaModel.expiresAt),
      used: prismaModel.used ?? false,
      createdAt: new Date(prismaModel.createdAt ?? new Date()),
      isDeleted: prismaModel.isDeleted ?? false,
    });
  }
}
