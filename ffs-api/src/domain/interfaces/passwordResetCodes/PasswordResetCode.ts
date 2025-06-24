import { config } from "../../../config/env";
import { generateVerificationCode } from "../../../shared/utils/generatePasswordAndCode";

export interface IPasswordResetCodeProps {
  id: number;
  userId: number;
  code: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export class PasswordResetCode {
  id: number;
  userId: number;
  code: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;

  constructor({
    id,
    userId,
    code,
    expiresAt,
    used = false,
    createdAt = new Date(),
  }: IPasswordResetCodeProps) {
    this.id = id;
    this.userId = userId;
    this.code = code;
    this.expiresAt = expiresAt;
    this.used = used;
    this.createdAt = createdAt;
  }

  public static create(userId: number): PasswordResetCode {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + config.verificationCodeExpiration);
  
    return new PasswordResetCode({
      id: -1, // fake
      userId,
      code,
      expiresAt,
      used: false,
      createdAt: new Date(),
    });
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isValid(): boolean {
    return !this.isExpired() && !this.used;
  }

  markAsUsed() {
    this.used = true;
  }
}