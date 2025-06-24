
import { Prisma } from "@prisma/client"; // adjust path if needed
import { PasswordResetCode } from "../../domain/interfaces/passwordResetCodes/PasswordResetCode";

export class PasswordResetCodeMapper {
  /**
   * Maps domain object to Prisma create input (excludes auto-generated `id`)
   */
  static toPrisma(entity: PasswordResetCode): Prisma.PasswordResetCodeCreateInput {
    return {
      code: entity.code,
      expiresAt: entity.expiresAt,
      used: entity.used,
      createdAt: entity.createdAt,
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
  static toDomain(prismaModel: Prisma.PasswordResetCodeUncheckedCreateInput): PasswordResetCode {
    return new PasswordResetCode({
      id: prismaModel.id ?? -1, // fallback if undefined
      userId: prismaModel.userId,
      code: prismaModel.code,
      expiresAt: new Date(prismaModel.expiresAt),
      used: prismaModel.used ?? false,
      createdAt: new Date(prismaModel.createdAt ?? new Date()),
    });
  }
}
