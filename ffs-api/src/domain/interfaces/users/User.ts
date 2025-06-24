import bcrypt from 'bcrypt';
import { Bid } from '../Bids/Bid';
import { UserRole } from '../userRoles/UserRole';
import { UserStatus } from '../userStatuses/UserStatus';
import { RoleCategoryEnum } from '../../constants/RoleCategoryEnum';
import { config } from '../../../config/env';
import { Cooperative } from '../Cooperatives/Cooperative';
import { District } from '../Districts/District';
import { UserManagedBid } from '../UserManagedBids/UserManagedBid';
import { BidManager } from '../BidManagers/BidManager';
import { BulkUpload } from '../bulkUploads/BulkUpload';
import { EmailVerificationCode } from '../emailVerificationCodes/EmailVerificationCode';
import { Invitation } from '../invitations/Invitation';
import { PasswordResetCode } from '../passwordResetCodes/PasswordResetCode';
import { Task } from '../tasks/Task';
import { UpdateUserRequestData } from '../../../interfaces/requests/users/UpdateUserRequest';
import { StatusEnum } from '../../constants/StatusEnum';

export interface IUserProps {
  id: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  statusId: number;
  userStatus: UserStatus;
  lastLogin?: Date | null;
  demoAccount: boolean;
  cooperativeId?: number | null;
  districtId?: number | null;
  isDeleted: boolean;
  emailVerified: boolean;
  cooperative?: Cooperative | null;
  district?: District | null;
  userRoles?: UserRole[];
  managedBids?: UserManagedBid[];
  bidManagers?: BidManager[];
  bids?: Bid[];
  bulkUserUploads?: BulkUpload[];
  emailVerificationCodes?: EmailVerificationCode[];
  invitations?: Invitation[];
  passwordResetCodes?: PasswordResetCode[];
  tasks?: Task[];
}

export class User {
  id: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  statusId: number;
  userStatus: UserStatus;
  lastLogin?: Date | null;
  demoAccount: boolean;
  cooperativeId?: number | null;
  districtId?: number | null;
  isDeleted: boolean;
  emailVerified: boolean;
  cooperative: Cooperative | null;
  district: District | null;
  userRoles: UserRole[];
  managedBids: UserManagedBid[];
  bidManagers: BidManager[];
  bids: Bid[];
  bulkUserUploads: BulkUpload[];
  emailVerificationCodes: EmailVerificationCode[];
  invitations: Invitation[];
  passwordResetCodes: PasswordResetCode[];
  tasks: Task[];

  constructor({
    id,
    email,
    passwordHash,
    firstName,
    lastName,
    statusId,
    userStatus,
    lastLogin = null,
    demoAccount = false,
    cooperativeId = null,
    districtId = null,
    isDeleted = false,
    emailVerified = false,
    cooperative = null,
    district = null,
    userRoles = [],
    managedBids = [],
    bidManagers = [],
    bids = [],
    bulkUserUploads = [],
    emailVerificationCodes = [],
    invitations = [],
    passwordResetCodes = [],
    tasks = [],
  }: IUserProps) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.firstName = firstName;
    this.lastName = lastName;
    this.statusId = statusId;
    this.userStatus = userStatus;
    this.lastLogin = lastLogin;
    this.demoAccount = demoAccount;
    this.cooperativeId = cooperativeId;
    this.districtId = districtId;
    this.isDeleted = isDeleted;
    this.emailVerified = emailVerified;
    this.cooperative = cooperative;
    this.district = district;
    this.userRoles = userRoles;
    this.managedBids = managedBids;
    this.bidManagers = bidManagers;
    this.bids = bids;
    this.bulkUserUploads = bulkUserUploads;
    this.emailVerificationCodes = emailVerificationCodes;
    this.invitations = invitations;
    this.passwordResetCodes = passwordResetCodes;
    this.tasks = tasks;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isActive(): boolean {
    return this.userStatus.id === 1; // Assuming 1 is the active status
  }

  isEmailVerified(): boolean {
    return this.emailVerified;
  }

  markEmailAsVerified(): void {
    this.emailVerified = true;
  }

  async checkPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.passwordHash);
  }

  getAdminRoles(): UserRole[] {
    return this.userRoles.filter(userRole => 
      userRole?.role?.roleCategory?.name === RoleCategoryEnum.ADMIN);
  }

  getBidRoles(): UserRole[] {
    return this.userRoles.filter(userRole => 
      userRole?.role?.roleCategory?.name === RoleCategoryEnum.BID);
  }

  async updatePassword(newPassword: string): Promise<void> {
    this.passwordHash = await bcrypt.hash(newPassword, config.saltRounds);
  }

  static create(props: IUserProps): User {
    return new User(props);
  }

  markAsInactive(): void {
    this.statusId = StatusEnum.INACTIVE;
  }

  markAsActive(): void {
    this.statusId = StatusEnum.ACTIVE;
  }

  static updateFromData(existingUser: User, updateData: UpdateUserRequestData): User {
    const updatedProps: IUserProps = {
      ...existingUser,
      firstName: updateData.firstName ?? existingUser.firstName,
      lastName: updateData.lastName ?? existingUser.lastName,
      email: updateData.email ?? existingUser.email,
    };

    return new User(updatedProps);
  }

  softDelete(): void {
    this.isDeleted = true;
  }
}
