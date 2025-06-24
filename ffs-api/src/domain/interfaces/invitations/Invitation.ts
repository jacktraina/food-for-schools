import { UserStatus } from "../userStatuses/UserStatus";
import { District } from "../Districts/District";
import { User } from "../users/User";
import { Role } from "../roles/Role";
import { Cooperative } from "../Cooperatives/Cooperative";

export interface IInvitationProps {
  id: number; // Made optional as it's auto-incremented
  email: string;
  districtId?: number | null;
  cooperativeId?: number | null;
  invitedBy: number;
  statusId: number;
  createdAt?: Date | null;
  expirationDate?: Date | null;
  invitedRoleId?: number | null;
  token?: string | null;
  userStatus?: UserStatus;
  district?: District;
  cooperative?: Cooperative;
  invitedByUser?: User;
  invitedRole?: Role;
}

export class Invitation {
  id: number;
  email: string;
  districtId?: number | null;
  cooperativeId?: number | null;
  invitedBy: number;
  statusId: number;
  createdAt: Date | null;
  expirationDate: Date | null;
  invitedRoleId?: number | null;
  token?: string | null;
  userStatus?: UserStatus;
  district?: District;
  invitedByUser?: User;
  invitedRole?: Role;
  cooperative?: Cooperative;

  constructor({
    id,
    email,
    districtId,
    cooperativeId,
    invitedBy,
    statusId,
    createdAt,
    expirationDate,
    invitedRoleId,
    token,
    userStatus,
    district,
    invitedByUser,
    invitedRole,
  cooperative,
  }: IInvitationProps) {
    this.id = id;
    this.email = email;
    this.districtId = districtId;
    this.cooperativeId = cooperativeId;
    this.invitedBy = invitedBy;
    this.statusId = statusId;
    this.createdAt = createdAt ?? new Date(); // Align with schema's default(now())
    this.expirationDate = expirationDate ?? null;
    this.invitedRoleId = invitedRoleId;
    this.token = token;
    this.userStatus = userStatus;
    this.district = district;
    this.invitedByUser = invitedByUser;
    this.invitedRole = invitedRole;
    this.cooperative = cooperative;

    // Validate required fields
    Invitation.validateEmail(email);
    Invitation.validateInvitedBy(invitedBy);
    Invitation.validateStatusId(statusId);
  }

  static validateEmail(email: string): void {
    if (!email || email.trim() === '') {
      throw new Error('email is required and cannot be empty');
    }
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('email must be a valid email address');
    }
  }

  static validateInvitedBy(invitedBy: number): void {
    if (!Number.isInteger(invitedBy) || invitedBy <= 0) {
      throw new Error('invitedBy must be a positive integer');
    }
  }

  static validateStatusId(statusId: number): void {
    if (!Number.isInteger(statusId) || statusId <= 0) {
      throw new Error('statusId must be a positive integer');
    }
  }

  isExpired(): boolean {
    if (!this.expirationDate) return false;
    return this.expirationDate < new Date();
  }
}
