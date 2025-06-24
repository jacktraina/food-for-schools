import { UserService } from '../../../../src/application/services/UserService';
import { IUserRepository } from '../../../../src/domain/interfaces/users/IUserRepository';
import { IEmailVerificationCodeRepository } from '../../../../src/domain/interfaces/emailVerificationCodes/IEmailVerificationCodeRepository';
import { IPasswordResetCodeRepository } from '../../../../src/domain/interfaces/passwordResetCodes/IPasswordResetCodeRepository';
import { IEmailServicePort } from '../../../../src/domain/core/IEmailServicePort';
import { EmailTemplates } from '../../../../src/shared/emailTemplates/EmailTemplates';
import { IInvitationRepository } from '../../../../src/domain/interfaces/invitations/IInvitationRepository';
import { User } from '../../../../src/domain/interfaces/users/User';
import { Invitation } from '../../../../src/domain/interfaces/invitations/Invitation';
import { InvitationStatusEnum } from '../../../../src/domain/constants/InvitationStatusEnum';
import { BadRequestError } from '../../../../src/domain/core/errors/BadRequestError';
import { NotFoundError } from '../../../../src/domain/core/errors/NotFoundError';

describe('UserService - inviteUser', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockEmailVerificationCodeRepository: jest.Mocked<IEmailVerificationCodeRepository>;
  let mockPasswordResetCodeRepository: jest.Mocked<IPasswordResetCodeRepository>;
  let mockEmailService: jest.Mocked<IEmailServicePort>;
  let mockEmailTemplates: jest.Mocked<EmailTemplates>;
  let mockInvitationRepository: jest.Mocked<IInvitationRepository>;
  let mockOneSignalService: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByIdWithRoles: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    mockEmailVerificationCodeRepository = {
      create: jest.fn(),
      findByUserIdAndCode: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IEmailVerificationCodeRepository>;

    mockPasswordResetCodeRepository = {
      create: jest.fn(),
      findByUserIdAndCode: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IPasswordResetCodeRepository>;

    mockEmailService = {
      sendEmail: jest.fn(),
    } as unknown as jest.Mocked<IEmailServicePort>;

    mockEmailTemplates = {
      generateInvitationEmailTemplate: jest.fn(),
    } as unknown as jest.Mocked<EmailTemplates>;

    mockInvitationRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IInvitationRepository>;

    mockOneSignalService = {
      sendEmail: jest.fn(),
      sendPushNotification: jest.fn(),
    } as any;

    userService = new UserService(
      mockUserRepository,
      mockEmailVerificationCodeRepository,
      mockEmailService,
      mockOneSignalService,
      mockEmailTemplates as unknown as EmailTemplates,
      mockPasswordResetCodeRepository,
      mockInvitationRepository,
      {} as any // mockBulkUploadRepository
    );
  });

  it('should throw BadRequestError if user with email already exists', async () => {
    const invitationData = {
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'Group Admin',
    };
    const invitedBy = 1;

    mockUserRepository.findByEmail.mockResolvedValue({} as User);

    await expect(userService.inviteUser(invitationData, invitedBy)).rejects.toThrow(BadRequestError);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(invitationData.email);
  });

  it('should throw BadRequestError if invitation for email already exists', async () => {
    const invitationData = {
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'Group Admin',
    };
    const invitedBy = 1;

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockInvitationRepository.findByEmail.mockResolvedValue({
      statusId: InvitationStatusEnum.PENDING,
    } as Invitation);

    await expect(userService.inviteUser(invitationData, invitedBy)).rejects.toThrow(BadRequestError);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(invitationData.email);
    expect(mockInvitationRepository.findByEmail).toHaveBeenCalledWith(invitationData.email);
  });

  it('should throw NotFoundError if inviter not found', async () => {
    const invitationData = {
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'Group Admin',
    };
    const invitedBy = 1;

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockInvitationRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(userService.inviteUser(invitationData, invitedBy)).rejects.toThrow(NotFoundError);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(invitationData.email);
    expect(mockInvitationRepository.findByEmail).toHaveBeenCalledWith(invitationData.email);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(invitedBy);
  });

  it('should create invitation and send email successfully', async () => {
    const invitationData = {
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'Group Admin',
    };
    const invitedBy = 1;
    const inviter = {
      id: invitedBy,
      firstName: 'Admin',
      lastName: 'User',
      districtId: 1,
    } as User;
    const createdInvitation = {
      id: 1,
      email: invitationData.email,
    } as Invitation;

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockInvitationRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.findById.mockResolvedValue(inviter);
    mockInvitationRepository.create.mockImplementation(async (invitation) => {
      return {
        ...invitation,
        id: 1,
      } as Invitation;
    });
    mockEmailTemplates.generateInvitationEmailTemplate.mockReturnValue('<html>Email template</html>');
    mockEmailService.sendEmail.mockResolvedValue();

    await userService.inviteUser(invitationData, invitedBy);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(invitationData.email);
    expect(mockInvitationRepository.findByEmail).toHaveBeenCalledWith(invitationData.email);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(invitedBy);
    expect(mockInvitationRepository.create).toHaveBeenCalled();
    expect(mockEmailTemplates.generateInvitationEmailTemplate).toHaveBeenCalled();
    expect(mockOneSignalService.sendEmail).toHaveBeenCalled();
  });
});
