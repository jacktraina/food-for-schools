import { config } from "../../../config/env";
import { generateVerificationCode } from "../../../shared/utils/generatePasswordAndCode";

export interface IEmailVerificationCodeProps {
  id: number;
  userId: number;
  code: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  isDeleted: boolean;
}

export class EmailVerificationCode {
  id: number;
  userId: number;
  code: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  isDeleted: boolean;

  constructor({
    id,
    userId,
    code,
    expiresAt,
    used = false,
    createdAt = new Date(),
    isDeleted = false,
  }: IEmailVerificationCodeProps) {
    this.id = id;
    this.userId = userId;
    this.code = code;
    this.expiresAt = expiresAt;
    this.used = used;
    this.createdAt = createdAt;
    this.isDeleted = isDeleted;
  }

  public static create(userId: number): EmailVerificationCode {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + config.verificationCodeExpiration);

    return new EmailVerificationCode({
      id: -1, // Or let the database handle ID generation
      userId,
      code,
      expiresAt,
      used: false,
      createdAt: new Date(),
      isDeleted: false,
    });
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isValid(): boolean {
    return !this.isExpired() && !this.used && !this.isDeleted;
  }

  markAsUsed() {
    this.used = true;
  }
}