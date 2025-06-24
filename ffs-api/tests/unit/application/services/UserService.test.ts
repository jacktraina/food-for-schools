import { UserService } from '../../../../src/application/services/UserService';
import { IUserRepository } from '../../../../src/domain/interfaces/users/IUserRepository';
import { IEmailVerificationCodeRepository } from '../../../../src/domain/interfaces/emailVerificationCodes/IEmailVerificationCodeRepository';
import { IEmailServicePort } from '../../../../src/domain/core/IEmailServicePort';
import { User } from '../../../../src/domain/interfaces/users/User';
import { UnauthorizedError } from '../../../../src/domain/core/errors/UnauthorizedError';
import { ForbiddenError } from '../../../../src/domain/core/errors/ForbiddenError';
import { BadRequestError } from '../../../../src/domain/core/errors/BadRequestError';
import { AppError } from '../../../../src/interfaces/middleware/errorHandler';
import { EmailTemplates } from '../../../../src/shared/emailTemplates/EmailTemplates';
import { UserRole } from '../../../../src/domain/interfaces/userRoles/UserRole';
import { Bid } from '../../../../src/domain/interfaces/Bids/Bid';
import { Scope } from '../../../../src/domain/interfaces/scopes/Scope';
import { ScopeType } from '../../../../src/domain/interfaces/scopeTypes/ScopeType';
import { Role } from '../../../../src/domain/interfaces/roles/Role';
import { IPasswordResetCodeRepository } from '../../../../src/domain/interfaces/passwordResetCodes/IPasswordResetCodeRepository';
import { IInvitationRepository } from '../../../../src/domain/interfaces/invitations/IInvitationRepository';

// Add these to your existing mock setup
const mockPasswordResetCode = {
  id: 1,
  userId: 1,
  code: '123456',
  expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
  used: false,
  createdAt: new Date(),
  markAsUsed: jest.fn(),
  isExpired: jest.fn().mockReturnValue(false),
  isValid: jest.fn().mockReturnValue(true),
};

const mockExpiredPasswordResetCode = {
  ...mockPasswordResetCode,
  expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
  isExpired: jest.fn().mockReturnValue(true),
  isValid: jest.fn().mockReturnValue(false),
};

const mockUsedPasswordResetCode = {
  ...mockPasswordResetCode,
  used: true,
  isValid: jest.fn().mockReturnValue(false),
};

// Mock dependencies
const mockUserRepository: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  getUserDetails: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  findDistrictById: jest.fn(),
  findAllUsers: jest.fn(),
  searchUsers: jest.fn(),
  create: jest.fn(),
  updatePassword: jest.fn(),
  markAsEmailVerified: jest.fn(),
  findManyByIds: jest.fn(),
  softDelete: jest.fn()
};

const mockEmailVerificationCodeRepository: jest.Mocked<IEmailVerificationCodeRepository> = {
  create: jest.fn(),
  findByUserIdAndCode: jest.fn(),
  markAsUsed: jest.fn(),
  createWithTransaction: jest.fn(),
  update: jest.fn(),
  // Add other methods if needed
};

const mockEmailService: jest.Mocked<IEmailServicePort> = {
  sendEmail: jest.fn(),
  // Add other methods if needed
};

const mockOneSignalService = {
  sendEmail: jest.fn(),
  sendPushNotification: jest.fn(),
} as any;

const mockEmailTemplates = {
  generateUserCreatedEmailTemplate: jest.fn().mockReturnValue('<html>Email Template</html>'),
  generateResetPasswordEmailTemplate: jest.fn().mockReturnValue('<html>Email Template</html>'),
  generateVerifyEmailTemplate: jest.fn().mockReturnValue('<html>Email Template</html>'),
} as unknown as EmailTemplates;

const passwordResetCodeRepository = {
  findByUserIdAndCode: jest.fn(),
  markAsUsed: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
} as unknown as jest.Mocked<IPasswordResetCodeRepository>;

const mockInvitationRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
} as unknown as jest.Mocked<IInvitationRepository>;

const mockUser: Partial<User> = {
  id: 1,
  email: 'test@example.com',
  passwordHash: 'hashedpassword',
  firstName: 'John',
  lastName: 'Doe',
  checkPassword: jest.fn(),
  isEmailVerified: jest.fn(),
  userStatus: { id: 1, name: 'Active' } as any,
  lastLogin: new Date(),
  demoAccount: false,
  districtId: 1,
  isDeleted: false,
  emailVerified: true,
} as Partial<User> & { checkPassword: jest.Mock; isEmailVerified: jest.Mock };

const mockUserDetails = {
  id: 1,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  userStatus: { name: 'Active' },
  lastLogin: new Date(),
  demoAccount: false,
  userRoles: [
    {
      role: { name: 'Admin', rolePermissions: [{ permission: { name: 'create_user' } }] } as Partial<Role>,
      scope: { id: 1, scopeType: { name: 'Global' } } as Partial<Scope> & { scopeType: Partial<ScopeType> },
    } as Partial<UserRole>,
  ],
  managedBids: [] as Partial<Bid>[],
  getAdminRoles: jest.fn(),
  getBidRoles: jest.fn(),
} as any;

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(
      mockUserRepository,
      mockEmailVerificationCodeRepository,
      mockEmailService,
      mockOneSignalService,
      mockEmailTemplates,
      passwordResetCodeRepository,
      mockInvitationRepository,
      {} as any // mockBulkUploadRepository
    );

    // Reset mock implementations
    mockPasswordResetCode.markAsUsed.mockClear();
    mockPasswordResetCode.isExpired.mockImplementation(() => false);
    mockPasswordResetCode.isValid.mockImplementation(() => true);
  });

  describe('login', () => {
    const mockUser: Partial<User> = {
      id: 1,
      email: 'test@example.com',
      checkPassword: jest.fn(),
      isEmailVerified: jest.fn(),
    };

    const mockUserDetails = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      userStatus: { name: 'Active' },
      lastLogin: new Date(),
      demoAccount: false,
      getAdminRoles: jest.fn(),
      getBidRoles: jest.fn(),
      managedBids: [],
      organization: {
        id: 1,
        name: 'Test Organization',
        createAt: new Date(),
        organizationTypeId: 1,
        superadminId: null,
        statusId: 1,
        streetAddress1: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        email: 'test@gmail.com',
        organizationType: { id: 1, name: 'Test Type' }
      }
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      (mockUser.checkPassword as jest.Mock).mockResolvedValue(true);
      (mockUser.isEmailVerified as jest.Mock).mockReturnValue(true);
      mockUserRepository.getUserDetails.mockResolvedValue(mockUserDetails as any);

      const mockRoles = [
        { 
          role: { name: 'Admin', rolePermissions: [{ permission: { name: 'create_user' } }] },
          scope: { id: 1, scopeType: { name: 'Global' } }
        }
      ];
      mockUserDetails.getAdminRoles.mockReturnValue(mockRoles);
      mockUserDetails.getBidRoles.mockReturnValue([]);

      // Act
      const result = await userService.login('test@example.com', 'password123');

      // Assert
      expect(result.message).toBe('Login successful');
      expect(result.accessToken).toBeDefined();
      expect(result.user.name).toBe('John Doe');
      expect(result.user.roles).toHaveLength(1);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUser.checkPassword).toHaveBeenCalledWith('password123');
    });

    it('should throw UnauthorizedError when user does not exist', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.login('nonexistent@example.com', 'password123'))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when password is invalid', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      (mockUser.checkPassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(userService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should throw ForbiddenError and send verification email when email is not verified', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      (mockUser.checkPassword as jest.Mock).mockResolvedValue(true);
      (mockUser.isEmailVerified as jest.Mock).mockReturnValue(false);

      // Act & Assert
      await expect(userService.login('test@example.com', 'password123'))
        .rejects.toThrow(ForbiddenError);

      expect(mockEmailVerificationCodeRepository.create).toHaveBeenCalled();
      expect(mockOneSignalService.sendEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestError when user details cannot be retrieved', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      (mockUser.checkPassword as jest.Mock).mockResolvedValue(true);
      (mockUser.isEmailVerified as jest.Mock).mockReturnValue(true);
      mockUserRepository.getUserDetails.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.login('test@example.com', 'password123'))
        .rejects.toThrow(BadRequestError);
    });

    it('should handle partial role data gracefully', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      (mockUser.checkPassword as jest.Mock).mockResolvedValue(true);
      (mockUser.isEmailVerified as jest.Mock).mockReturnValue(true);
      mockUserRepository.getUserDetails.mockResolvedValue(mockUserDetails as any);

      const mockRoles = [
        { 
          role: null, // Missing role data
          scope: { id: 1, scopeType: null } // Missing scopeType
        }
      ];
      mockUserDetails.getAdminRoles.mockReturnValue(mockRoles);
      mockUserDetails.getBidRoles.mockReturnValue([]);

      // Act
      const result = await userService.login('test@example.com', 'password123');

      // Assert
      expect(result.user.roles[0].type).toBe('NA');
      expect(result.user.roles[0].scope.type).toBe('NA');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const mockUser = { id: 1, email: 'test@example.com' };
      mockUserRepository.findById.mockResolvedValue(mockUser as User);

      // Act
      const result = await userService.getUserById(1);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw AppError when user is not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(999))
        .rejects.toThrow(AppError);
    });
  });

  // Test for token creation (optional)
  describe('token creation', () => {
    it('should create a valid token for authenticated user', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      (mockUser.checkPassword as jest.Mock).mockResolvedValue(true);
      (mockUser.isEmailVerified as jest.Mock).mockReturnValue(true);
      mockUserRepository.getUserDetails.mockResolvedValue(mockUserDetails as any);
      mockUserDetails.getAdminRoles.mockReturnValue([]);
      mockUserDetails.getBidRoles.mockReturnValue([]);

      // Act
      const result = await userService.login('test@example.com', 'password123');

      // Assert
      expect(result.accessToken).toBeDefined();
      // You could add more specific token validation here if needed
    });
  });

  describe('requestPasswordResetCode', () => {
    it('should successfully send a password reset code email', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      passwordResetCodeRepository.create.mockResolvedValue(mockPasswordResetCode);

      // Act
      const result = await userService.requestPasswordResetCode('test@example.com');

      // Assert
      expect(result.message).toBe('Password reset code has been sent to your email.');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(passwordResetCodeRepository.create).toHaveBeenCalled();
      expect(mockOneSignalService.sendEmail).toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when user does not exist', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.requestPasswordResetCode('nonexistent@example.com'))
        .rejects.toThrow(UnauthorizedError);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(passwordResetCodeRepository.create).not.toHaveBeenCalled();
      expect(mockOneSignalService.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle email sending failures gracefully', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      passwordResetCodeRepository.create.mockResolvedValue(mockPasswordResetCode);
      mockOneSignalService.sendEmail.mockRejectedValue(new Error('Email service down'));

      // Act & Assert
      await expect(userService.requestPasswordResetCode('test@example.com'))
        .rejects.toThrow('Email service down');
      
      // Verify code was still created even if email failed
      expect(passwordResetCodeRepository.create).toHaveBeenCalled();
    });
  });

  describe('passwordReset', () => {
    it('should successfully reset password with valid code', async () => {
      // Arrange
      const newPassword = 'newSecurePassword123!';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      passwordResetCodeRepository.findByUserIdAndCode.mockResolvedValue(mockPasswordResetCode);
      mockUser.updatePassword = jest.fn();
      mockUserRepository.update.mockResolvedValue(mockUser as User);
      passwordResetCodeRepository.update.mockResolvedValue(mockPasswordResetCode);

      // Act
      const result = await userService.passwordReset('test@example.com', '123456', newPassword);

      // Assert
      expect(result.message).toBe('Password has been reset successfully.');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(passwordResetCodeRepository.findByUserIdAndCode).toHaveBeenCalledWith(1, '123456');
      expect(mockUser.updatePassword).toHaveBeenCalledWith(newPassword);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser);
      expect(mockPasswordResetCode.markAsUsed).toHaveBeenCalled();
      expect(passwordResetCodeRepository.update).toHaveBeenCalledWith(mockPasswordResetCode);
    });

    it('should throw UnauthorizedError when user does not exist', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.passwordReset('nonexistent@example.com', '123456', 'newPass'))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when code does not exist', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      passwordResetCodeRepository.findByUserIdAndCode.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.passwordReset('test@example.com', 'invalid', 'newPass'))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when code is expired', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      passwordResetCodeRepository.findByUserIdAndCode.mockResolvedValue(mockExpiredPasswordResetCode);

      // Act & Assert
      await expect(userService.passwordReset('test@example.com', '123456', 'newPass'))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when code is already used', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      passwordResetCodeRepository.findByUserIdAndCode.mockResolvedValue(mockUsedPasswordResetCode);

      // Act & Assert
      await expect(userService.passwordReset('test@example.com', '123456', 'newPass'))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should handle password update failures', async () => {
      // Arrange
      const newPassword = 'newSecurePassword123!';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      passwordResetCodeRepository.findByUserIdAndCode.mockResolvedValue(mockPasswordResetCode);
      mockUser.updatePassword = jest.fn().mockImplementation(() => {
        throw new Error('Password update failed');
      });

      // Act & Assert
      await expect(userService.passwordReset('test@example.com', '123456', newPassword))
        .rejects.toThrow('Password update failed');
      
      // Verify code was not marked as used if password update failed
      expect(mockPasswordResetCode.markAsUsed).not.toHaveBeenCalled();
    });

    it('should handle database update failures', async () => {
      // Arrange
      const newPassword = 'newSecurePassword123!';
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);
      passwordResetCodeRepository.findByUserIdAndCode.mockResolvedValue(mockPasswordResetCode);
      mockUser.updatePassword = jest.fn();
      mockUserRepository.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userService.passwordReset('test@example.com', '123456', newPassword))
        .rejects.toThrow('Database error');
      
      // Verify code was not marked as used if user update failed
      expect(mockPasswordResetCode.markAsUsed).not.toHaveBeenCalled();
    });
  });
});
