import { inject, injectable } from 'inversify';
import { IUserRepository } from '../../domain/interfaces/users/IUserRepository';
import TYPES from '../../shared/dependencyInjection/types';
import { createToken } from '../../shared/utils/createToken';
import { LoginResponse } from '../../interfaces/responses/users/LoginResponse';
import { UnauthorizedError } from '../../domain/core/errors/UnauthorizedError';
import { AppError } from '../../interfaces/middleware/errorHandler';
import { BadRequestError } from '../../domain/core/errors/BadRequestError';
import { User } from '../../domain/interfaces/users/User';
import { IEmailVerificationCodeRepository } from '../../domain/interfaces/emailVerificationCodes/IEmailVerificationCodeRepository';
import { IEmailServicePort } from '../../domain/core/IEmailServicePort';
import { IOneSignalServicePort } from '../../domain/core/IOneSignalServicePort';
import { EmailTemplates } from '../../shared/emailTemplates/EmailTemplates';
import { IUserService } from '../contracts/IUserService';
import { ForbiddenError } from '../../domain/core/errors/ForbiddenError';
import { UserRole } from '../../domain/interfaces/userRoles/UserRole';
import { EmailVerificationCode } from '../../domain/interfaces/emailVerificationCodes/EmailVerificationCode';
import { PasswordResetResponse } from '../../interfaces/responses/users/PasswordResetResponse';
import { PasswordResetCodeResponse } from '../../interfaces/responses/users/PasswordResetCodeResponse';
import { PasswordResetCode } from '../../domain/interfaces/passwordResetCodes/PasswordResetCode';
import { IPasswordResetCodeRepository } from '../../domain/interfaces/passwordResetCodes/IPasswordResetCodeRepository';
import { EmailVerificationCodeResponse } from '../../interfaces/responses/users/EmailVerificationCodeResponse';
import { NotFoundError } from '../../domain/core/errors/NotFoundError';
import { IInvitationRepository } from '../../domain/interfaces/invitations/IInvitationRepository';
import { Invitation } from '../../domain/interfaces/invitations/Invitation';
import { InvitationStatusEnum } from '../../domain/constants/InvitationStatusEnum';
import { ListUsersResponse, RoleAssignment, BidRoleAssignment } from '../../interfaces/responses/users/ListUsersResponse';
import crypto from 'crypto';
import { parse } from 'csv-parse/sync';
import { IBulkUploadRepository } from '../../domain/interfaces/bulkUploads/IBulkUploadRepository';
import { BulkUpload } from '../../domain/interfaces/bulkUploads/BulkUpload';
import { generateBulkUserTemplate } from '../../shared/utils/csvGenerator';
import { UpdateUserRequestData } from '../../interfaces/requests/users/UpdateUserRequest';
import { DeactivateUserResponse } from '../../interfaces/responses/users/DeactivateUserResponse';
import { ActivateUserResponse } from '../../interfaces/responses/users/ActivateUserResponse';
import { DeleteUserResponse } from '../../interfaces/responses/users/DeleteUserResponse';
import { SearchFilters } from '../../interfaces/requests/users/SearchUsersRequest';
import { AuthResponse_User, AuthResponse_User_Role } from '../../interfaces/responses/base/AuthResponse';
import { LoginResponseMapper } from '../mappers/LoginResponseMapper';

@injectable()
export class UserService implements IUserService {
  private userRepository: IUserRepository;
  // private userRoleRepository: IUserRoleRepository;
  private emailVerificationCodeRepository: IEmailVerificationCodeRepository;
  private passwordResetCodeRepository: IPasswordResetCodeRepository;
  private emailService: IEmailServicePort;
  private oneSignalService: IOneSignalServicePort;
  private emailTemplates: EmailTemplates;
  private invitationRepository: IInvitationRepository;
  private bulkUploadRepository: IBulkUploadRepository;
  // private database: IDatabaseService;

  constructor(
    @inject(TYPES.IUserRepository) userRepository: IUserRepository,
    // @inject(TYPES.IUserRoleRepository) userRoleRepository: IUserRoleRepository,
    @inject(TYPES.IEmailVerificationCodeRepository) emailVerificationCodeRepository: IEmailVerificationCodeRepository,
    @inject(TYPES.IEmailServicePort) emailService: IEmailServicePort,
    @inject(TYPES.IOneSignalServicePort) oneSignalService: IOneSignalServicePort,
    @inject(TYPES.EmailTemplates) emailTemplates: EmailTemplates,
    // @inject(TYPES.IDatabaseService) database: IDatabaseService,
    @inject(TYPES.IPasswordResetCodeRepository) passwordResetCodeRepository: IPasswordResetCodeRepository,
    @inject(TYPES.IInvitationRepository) invitationRepository: IInvitationRepository,
    @inject(TYPES.IBulkUploadRepository) bulkUploadRepository: IBulkUploadRepository,
  ) {
    this.userRepository = userRepository;
    // this.userRoleRepository = userRoleRepository;
    this.emailVerificationCodeRepository = emailVerificationCodeRepository;
    this.passwordResetCodeRepository = passwordResetCodeRepository;
    this.emailService = emailService;
    this.oneSignalService = oneSignalService;
    this.emailTemplates = emailTemplates;
    this.invitationRepository = invitationRepository;
    this.bulkUploadRepository = bulkUploadRepository;
    // this.database = database;
  }
  
  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("User does not exist");
    }

    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isEmailVerified()) {

      const emailVerificationCode = EmailVerificationCode.create(user.id);

      await this.emailVerificationCodeRepository.create(emailVerificationCode);

      console.log('generateVerificationCode', emailVerificationCode.code);

      const body = this.emailTemplates.generateVerifyEmailTemplate(emailVerificationCode.code);
      await this.oneSignalService.sendEmail(
        email,
        'Verify Your Email',
        body
      );

      throw new ForbiddenError("Email not verified");
    }

    const userAuth = await this.getUserDetails(user.id);

    const loginUser = LoginResponseMapper.mapFromAuthResponse(userAuth);

    const accessToken = createToken(user.id);
    
    return {
      message: "Login successful",
      accessToken,
      user: loginUser
    };
  }

  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async getUserDetails(userId: number): Promise<AuthResponse_User> {
    const userDetails = await this.userRepository.getUserDetails(userId);
    if (!userDetails) {
      throw new BadRequestError('User not found');
    }

    const mapRoleToDto = (userRole: UserRole): AuthResponse_User_Role => ({
      id: userRole?.roleId ?? -1,
      type: userRole?.role?.name ?? 'NA',
      scope: {
        id: userRole?.scope?.id ?? 0,
        type: userRole?.scope?.scopeType?.name ?? 'NA'
      },
      permissions: userRole?.role?.rolePermissions?.map(rp => ({
        id: rp?.permissionId ?? -1,
        name: rp?.permission?.name ?? 'NA'
      })) || []
    });

    const appRoles = userDetails.getAdminRoles().map(mapRoleToDto);
    const bidRoles = userDetails.getBidRoles().map(mapRoleToDto);

    const manageBids = userDetails.managedBids.length > 0
      ? userDetails.managedBids.map(managedBid => ({
          id: managedBid.bid?.id || 0,
          code: managedBid.bid?.code || ''
        }))
      : [];

    return {
      id: userDetails.id,
      name: userDetails.fullName,
      email: userDetails.email,
      cooperativeId: userDetails.cooperativeId || null,
      districtId: userDetails.districtId || null,
      roles: appRoles,
      bidRoles: bidRoles,
      manageBids: manageBids,
      status: userDetails.userStatus.name,
      lastLogin: userDetails.lastLogin || new Date(),
      demoAccount: userDetails.demoAccount,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName
    };
  }

  // async createUser(
  //   email: string,
  //   firstName: string,
  //   lastName: string,
  //   initials: string,
  //   roleId: number
  // ): Promise<CreateUserResponse> {
  //   const user = await this.userRepository.findByEmail(email);
  //   if (user) {
  //     throw new UnauthorizedError(
  //       'User already exists with this email address'
  //     );
  //   }

  //   const password = generatePassword();
  //   const code = generateVerificationCode();

  //   console.log('Generated password: ', password);
  //   console.log('Generated Code: ', code);

  //   const passwordHash = await bcrypt.hash(password, config.saltRounds);

  //   const newUser = await this.userRepository.create({
  //     email: email,
  //     firstName: firstName,
  //     lastName: lastName,
  //     passwordHash: passwordHash,
  //     initials: initials,
  //   });

  //   await this.userRoleRepository.create({
  //     userId: newUser.id,
  //     roleId: roleId,
  //   });

  //   await this.emailVerificationCodeRepository.create({
  //     userId: newUser.id,
  //     code,
  //     expiresAt: new Date(Date.now() + config.verificationCodeExpiration),
  //   });

  //   const body = this.emailTemplates.generateUserCreatedEmailTemplate(code, password);
  //   const emailSubject = 'Welcome to Picture Pros Platform - Account Verification';

  //   await this.emailService.sendEmail(
  //     email,
  //     emailSubject,
  //     body
  //   );

  //   return { message: 'User created. Email verification sent' };
  // }

  // async createUserInTransaction(
  //   email: string,
  //   firstName: string,
  //   lastName: string,
  //   initials: string,
  //   roleId: number
  // ): Promise<CreateUserResponse> {
  //   const reponse = await this.database.runInTransaction(async (prisma) => {
  //     // Check if user exists
  //     const existingUser = await this.userRepository.findByEmail(email);
  //     if (existingUser) {
  //       throw new UnauthorizedError('User already exists');
  //     }

  //     // Generate password and code
  //     const password = generatePassword();
  //     const code = generateVerificationCode();
  //     const passwordHash = await bcrypt.hash(password, config.saltRounds);

  //     // Create user with role (using repository)
  //     const newUser = await this.userRepository.createWithTransaction(
  //       prisma,
  //       { email, firstName, lastName, initials, passwordHash }
  //     );

  //     await this.userRoleRepository.createWithTransaction(prisma, {
  //       userId: newUser.id,
  //       roleId: roleId,
  //     });

  //     await this.emailVerificationCodeRepository.createWithTransaction(
  //       prisma,
  //       {
  //         userId: newUser.id,
  //         code,
  //         expiresAt: new Date(Date.now() + config.verificationCodeExpiration)
  //       }
  //     );

  //     // Send email (non-database operation)
  //     const body = this.emailTemplates.generateUserCreatedEmailTemplate(code, password);
  //     await this.emailService.sendEmail(
  //       email,
  //       'Welcome to Our Platform',
  //       body
  //     );

  //     return { message: 'User created successfully' };
  //   });

  //   if (Array.isArray(reponse)) {
  //     return { message: reponse[0]?.message };
  //   } else {
  //     return { message: reponse?.message };
  //   }
  // }

  async passwordReset(
    email: string,
    code: string,
    newPassword: string
  ): Promise<PasswordResetResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('User does not exist');
    }

    const passwordResetCode =
      await this.passwordResetCodeRepository.findByUserIdAndCode(user.id, code);

    if (
      !passwordResetCode ||
      passwordResetCode.expiresAt < new Date() ||
      passwordResetCode.used
    ) {
      throw new UnauthorizedError('Invalid or expired reset code.');
    }

    await user.updatePassword(newPassword);
    await this.userRepository.update(user);

    passwordResetCode.markAsUsed();
    await this.passwordResetCodeRepository.update(passwordResetCode);

    return { message: 'Password has been reset successfully.' };
  }

  async requestPasswordResetCode(
    email: string
  ): Promise<PasswordResetCodeResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('No user found with this email.');
    }

    const passwordResetCode = PasswordResetCode.create(user.id);

    await this.passwordResetCodeRepository.create(passwordResetCode);

    console.log('requestPasswordResetCode', passwordResetCode.code);
    
    const body = this.emailTemplates.generateResetPasswordEmailTemplate(passwordResetCode.code, user.email);
    await this.oneSignalService.sendEmail(
      email,
      'Reset Your Password',
      body
    );

    return {
      message: 'Password reset code has been sent to your email.',
    };
  }

  async requestEmailVerificationCode(
    email: string
  ): Promise<EmailVerificationCodeResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isEmailVerified()) {
      throw new BadRequestError('Email already verified.');
    }

    const emailVerificationCode = EmailVerificationCode.create(user.id);

    await this.emailVerificationCodeRepository.create(emailVerificationCode);

    console.log('generateVerificationCode', emailVerificationCode.code);

    const body = this.emailTemplates.generateVerifyEmailTemplate(emailVerificationCode.code);
    await this.oneSignalService.sendEmail(email, "Password Reset", body);

    return {
      message: 'Verification code sent to email.',
    };
  }

  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('User does not exist.');
    }

    const emailVerificationCode =
      await this.emailVerificationCodeRepository.findByUserIdAndCode(
        user.id,
        code
      );

    if (
      !emailVerificationCode ||
      !emailVerificationCode.isValid()
    ) {
      throw new UnauthorizedError('Invalid or expired verification code.');
    }

    user.markEmailAsVerified();
    await this.userRepository.update(user);

    emailVerificationCode.markAsUsed();
    await this.emailVerificationCodeRepository.update(emailVerificationCode);

    return { message: 'Email verified successfully.' };
  }

  async inviteUser(invitationData: {
    fullName: string;
    email: string;
    role: string;
    bidRole?: string;
    districtId?: number;
    schoolId?: number;
  }, invitedBy: number): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(invitationData.email);
    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    const existingInvitation = await this.invitationRepository.findByEmail(invitationData.email);
    if (existingInvitation && existingInvitation.statusId === InvitationStatusEnum.PENDING) {
      throw new BadRequestError('An invitation has already been sent to this email');
    }

    const inviter = await this.userRepository.findById(invitedBy);
    if (!inviter) {
      throw new NotFoundError('Inviter not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    const invitation = new Invitation({
      id: 0, // Will be set by the database
      email: invitationData.email,
       districtId: invitationData.districtId,
      invitedBy: invitedBy,
      statusId: InvitationStatusEnum.PENDING,
      expirationDate: expirationDate,
      invitedRoleId: null
    });

    await this.invitationRepository.create(invitation);

    const invitationLink = `${process.env.CLIENT_URL}/register?token=${token}&email=${encodeURIComponent(invitationData.email)}`;

    const emailBody = this.emailTemplates.generateInvitationEmailTemplate(
      invitationLink,
      `${inviter.firstName} ${inviter.lastName}`,
      invitationData.fullName
    );

    await this.oneSignalService.sendEmail(
      invitationData.email,
      `You've been invited to join ${process.env.COMPANY_NAME || 'Food for Schools'}`,
      emailBody
    );
  }

  async listUsers(requestingUserId: number): Promise<ListUsersResponse> {
    const requestingUser = await this.userRepository.getUserDetails(requestingUserId);
    if (!requestingUser) {
      throw new ForbiddenError('User not found');
    }

    const adminRoles = requestingUser.getAdminRoles().map(role => role.role?.name || '');
    const allowedRoles = ['Super-Admin', 'Group Admin', 'District Admin'];
    
    if (!adminRoles.some(role => allowedRoles.includes(role))) {
      throw new ForbiddenError('You do not have permission to list users');
    }

    const users = await this.userRepository.findAllUsers();

    return users.map(user => {
      const roles: RoleAssignment[] = user.getAdminRoles().map(userRole => ({
        type: userRole.role?.name || '',
        scope: {
          type: userRole.scope?.scopeType?.name?.toLowerCase() || 'unknown',
          id: userRole.scope?.id?.toString() || '0',
          name: userRole.scope?.name || undefined
        },
        permissions: userRole.role?.rolePermissions?.map(rp => rp.permission?.name || '') || []
      }));

      const bidRoles: BidRoleAssignment[] = user.getBidRoles().map(userRole => ({
        type: userRole.role?.name || '',
        scope: {
          type: userRole.scope?.scopeType?.name?.toLowerCase() || 'unknown',
          id: userRole.scope?.id?.toString() || '0',
          name: userRole.scope?.name || undefined
        },
        permissions: userRole.role?.rolePermissions?.map(rp => rp.permission?.name || '') || []
      }));

      const managedBids = user.managedBids?.map(managedBid => 
        managedBid.bid?.id?.toString() || '0'
      ) || [];

      return {
        id: user.id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles,
        bidRoles,
        managedBids,
        status: user.userStatus?.name || 'Unknown',
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
        demoAccount: user.demoAccount || false
      };
    });
  }

  async searchUsers(requestingUserId: number, filters: SearchFilters): Promise<ListUsersResponse> {
    const requestingUser = await this.userRepository.getUserDetails(requestingUserId);
    if (!requestingUser) {
      throw new ForbiddenError('User not found');
    }

    const adminRoles = requestingUser.getAdminRoles().map(role => role.role?.name || '');
    const allowedRoles = ['Super-Admin', 'Group Admin', 'District Admin'];
    
    if (!adminRoles.some(role => allowedRoles.includes(role))) {
      throw new ForbiddenError('You do not have permission to search users');
    }

    const users = await this.userRepository.searchUsers(filters);

    return users.map(user => {
      const roles: RoleAssignment[] = user.getAdminRoles().map(userRole => ({
        type: userRole.role?.name || '',
        scope: {
          type: userRole.scope?.scopeType?.name?.toLowerCase() || 'unknown',
          id: userRole.scope?.id?.toString() || '0',
          name: userRole.scope?.name || undefined
        },
        permissions: userRole.role?.rolePermissions?.map(rp => rp.permission?.name || '') || []
      }));

      const bidRoles: BidRoleAssignment[] = user.getBidRoles().map(userRole => ({
        type: userRole.role?.name || '',
        scope: {
          type: userRole.scope?.scopeType?.name?.toLowerCase() || 'unknown',
          id: userRole.scope?.id?.toString() || '0',
          name: userRole.scope?.name || undefined
        },
        permissions: userRole.role?.rolePermissions?.map(rp => rp.permission?.name || '') || []
      }));

      const managedBids = user.managedBids?.map(managedBid => 
        managedBid.bid?.id?.toString() || '0'
      ) || [];

      return {
        id: user.id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles,
        bidRoles,
        managedBids,
        status: user.userStatus?.name || 'Unknown',
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
        demoAccount: user.demoAccount || false
      };
    });
  }

  async bulkUploadUsers(file: Express.Multer.File, uploadedBy: number): Promise<{ message: string }> {
    if (!file || file.mimetype !== 'text/csv') {
      throw new BadRequestError('Invalid file format. Please upload a CSV file.');
    }

    try {
      const csvContent = file.buffer.toString('utf-8');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      const requiredColumns = ['email', 'full_name', 'role', 'bid_role', 'district_id', 'school_id'];
      if (records.length > 0) {
        const firstRecord = records[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRecord));
        if (missingColumns.length > 0) {
          throw new BadRequestError(`Missing required columns: ${missingColumns.join(', ')}`);
        }
      }

      const bulkUpload = new BulkUpload({
        id: 0,
        fileName: file.originalname,
        uploadedBy,
        status: 'Processing',
        totalRows: records.length
      });

      const createdBulkUpload = await this.bulkUploadRepository.create(bulkUpload);

      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const record of records) {
        try {
          await this.inviteUser({
            fullName: record.full_name,
            email: record.email.trim().toLowerCase(),
            role: record.role,
            bidRole: record.bid_role,
            districtId: record.district_id ? parseInt(record.district_id) : undefined,
            schoolId: record.school_id ? parseInt(record.school_id) : undefined
          }, uploadedBy);
          processed++;
        } catch (error) {
          failed++;
          errors.push(`Row ${processed + failed}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      createdBulkUpload.markAsCompleted(processed, failed);
      if (errors.length > 0) {
        createdBulkUpload.errorDetails = errors.slice(0, 10).join('; ') + (errors.length > 10 ? ` and ${errors.length - 10} more errors` : '');
      }
      await this.bulkUploadRepository.update(createdBulkUpload);

      return { message: `Bulk upload completed. ${processed} users invited, ${failed} failed.` };
    } catch (error) {
      throw new BadRequestError(`CSV processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateBulkUserTemplate(requestingUserId: number): Promise<string> {
    const requestingUser = await this.userRepository.getUserDetails(requestingUserId);
    if (!requestingUser) {
      throw new ForbiddenError('User not found');
    }

    const adminRoles = requestingUser.getAdminRoles().map(role => role.role?.name || '');
    const allowedRoles = ['Super-Admin', 'Group Admin', 'District Admin'];
    
    if (!adminRoles.some(role => allowedRoles.includes(role))) {
      throw new ForbiddenError('You do not have permission to download bulk upload template');
    }

    return generateBulkUserTemplate();
  }

  async getEligibleBidManagers(requestingUserId: number): Promise<ListUsersResponse> {
    const requestingUser = await this.userRepository.getUserDetails(requestingUserId);
    if (!requestingUser) {
      throw new ForbiddenError('User not found');
    }

    const adminRoles = requestingUser.getAdminRoles().map(role => role.role?.name || '');
    const allowedRoles = ['Super-Admin', 'Group Admin', 'District Admin'];
    
    if (!adminRoles.some(role => allowedRoles.includes(role))) {
      throw new ForbiddenError('You do not have permission to view eligible bid managers');
    }

    const users = await this.userRepository.findAllUsers();

    const eligibleUsers = users.filter(user => {
      const hasBidRoles = user.getBidRoles().length > 0;
      
      const hasAdminBidCapabilities = user.getAdminRoles().some(userRole => 
        ['Group Admin', 'District Admin', 'School Admin'].includes(userRole.role?.name || '')
      );

      return hasBidRoles || hasAdminBidCapabilities;
    });

    return eligibleUsers.map(user => {
      const roles: RoleAssignment[] = user.getAdminRoles().map(userRole => ({
        type: userRole.role?.name || '',
        scope: {
          type: userRole.scope?.scopeType?.name?.toLowerCase() || 'unknown',
          id: userRole.scope?.id?.toString() || '0',
          name: userRole.scope?.name || undefined
        },
        permissions: userRole.role?.rolePermissions?.map(rp => rp.permission?.name || '') || []
      }));

      const bidRoles: BidRoleAssignment[] = user.getBidRoles().map(userRole => ({
        type: userRole.role?.name || '',
        scope: {
          type: userRole.scope?.scopeType?.name?.toLowerCase() || 'unknown',
          id: userRole.scope?.id?.toString() || '0',
          name: userRole.scope?.name || undefined
        },
        permissions: userRole.role?.rolePermissions?.map(rp => rp.permission?.name || '') || []
      }));

      const managedBids = user.managedBids?.map(managedBid => 
        managedBid.bid?.id?.toString() || '0'
      ) || [];

      return {
        id: user.id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles,
        bidRoles,
        managedBids,
        status: user.userStatus?.name || 'Unknown',
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
        demoAccount: user.demoAccount || false
      };
    });
  }

  async updateUser(userId: number, updateData: UpdateUserRequestData): Promise<User> {
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    const updatedUser = User.updateFromData(existingUser, updateData);
    
    return this.userRepository.update(updatedUser);
  }

  async deactivateUser(userId: number): Promise<DeactivateUserResponse> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError("User");
      }

      user.markAsInactive();
      await this.userRepository.update(user);

      return { message: "User deactivated successfully" };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError("Failed to deactivate user");
    }
  }

  async activateUser(userId: number): Promise<ActivateUserResponse> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError("User");
      }

      user.markAsActive();
      await this.userRepository.update(user);

      return { message: "User activated successfully" };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError("Failed to activate user");
    }
  }

  async deleteUser(userId: number): Promise<DeleteUserResponse> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError("User");
      }

      if (user.isDeleted) {
        throw new BadRequestError("User has already been deleted");
      }

      await this.userRepository.softDelete(userId);

      return { message: "User deleted successfully" };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError("Failed to delete user");
    }
  }
}
