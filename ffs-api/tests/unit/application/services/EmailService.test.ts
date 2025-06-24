import { EmailService } from '../../../../src/application/services/EmailService';
import { EmailTemplates } from '../../../../src/shared/emailTemplates/EmailTemplates';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');
jest.mock('../../../../src/shared/emailTemplates/EmailTemplates');

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: jest.Mocked<nodemailer.Transporter>;
  let mockEmailTemplates: jest.Mocked<EmailTemplates>;

  beforeEach(() => {
    mockTransporter = {
      sendMail: jest.fn(),
    } as any;

    mockEmailTemplates = {
      generateInvitationEmailTemplate: jest.fn(),
      generateResetPasswordEmailTemplate: jest.fn(),
      generateUserCreatedEmailTemplate: jest.fn(),
      generateVerifyEmailTemplate: jest.fn(),
      generateOrganizationInvitationAcceptedEmailTemplate: jest.fn(),
    } as any;

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    (EmailTemplates as jest.Mock).mockImplementation(() => mockEmailTemplates);

    process.env.EMAIL_HOST = 'smtp.test.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASSWORD = 'password';
    process.env.EMAIL_FROM = 'noreply@example.com';
    process.env.CLIENT_URL = 'https://test.com';
    process.env.COMPANY_NAME = 'FFS';

    emailService = new EmailService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_PORT;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
    delete process.env.EMAIL_FROM;
    delete process.env.CLIENT_URL;
    delete process.env.COMPANY_NAME;
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const email = 'user@example.com';
      const code = 'RESET123';
      const mockTemplate = '<p>Password reset email content</p>';
      
      mockEmailTemplates.generateResetPasswordEmailTemplate.mockReturnValue(mockTemplate);
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await emailService.sendPasswordResetEmail(email, code);

      expect(mockEmailTemplates.generateResetPasswordEmailTemplate).toHaveBeenCalledWith(code, email);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: email,
        subject: 'Reset Your FFS Password',
        html: mockTemplate
      });
    });

    it('should handle email sending errors', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(emailService.sendPasswordResetEmail('user@example.com', 'CODE123')).rejects.toThrow('SMTP error');
    });
  });

  describe('sendUserCreatedEmail', () => {
    it('should send user created email successfully', async () => {
      const email = 'newuser@example.com';
      const code = 'VERIFY123';
      const password = 'tempPassword';
      const mockTemplate = '<p>User created email content</p>';
      
      mockEmailTemplates.generateUserCreatedEmailTemplate.mockReturnValue(mockTemplate);
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await emailService.sendUserCreatedEmail(email, code, password);

      expect(mockEmailTemplates.generateUserCreatedEmailTemplate).toHaveBeenCalledWith(code, password);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: email,
        subject: 'Welcome to FFS',
        html: mockTemplate
      });
    });
  });

  describe('sendInvitationEmail', () => {
    it('should send invitation email successfully', async () => {
      const email = 'invitee@example.com';
      const invitationLink = 'https://example.com/invite/123';
      const inviterName = 'John Doe';
      const fullName = 'Jane Smith';
      const mockTemplate = '<p>Invitation email content</p>';
      
      mockEmailTemplates.generateInvitationEmailTemplate.mockReturnValue(mockTemplate);
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await emailService.sendInvitationEmail(email, invitationLink, inviterName, fullName);

      expect(mockEmailTemplates.generateInvitationEmailTemplate).toHaveBeenCalledWith(invitationLink, inviterName, fullName);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: email,
        subject: "You've Been Invited to FFS",
        html: mockTemplate
      });
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      const email = 'user@example.com';
      const code = 'VERIFY123';
      const mockTemplate = '<p>Verification email content</p>';
      
      mockEmailTemplates.generateVerifyEmailTemplate.mockReturnValue(mockTemplate);
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await emailService.sendVerificationEmail(email, code);

      expect(mockEmailTemplates.generateVerifyEmailTemplate).toHaveBeenCalledWith(code);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: email,
        subject: 'Verify Your FFS Email',
        html: mockTemplate
      });
    });
  });

  describe('sendOrganizationInvitationAcceptedEmail', () => {
    it('should send organization invitation accepted email successfully', async () => {
      const email = 'user@example.com';
      const firstName = 'John';
      const organizationName = 'Test Organization';
      const mockTemplate = '<p>Organization invitation accepted email content</p>';
      
      mockEmailTemplates.generateOrganizationInvitationAcceptedEmailTemplate.mockReturnValue(mockTemplate);
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await emailService.sendOrganizationInvitationAcceptedEmail(email, firstName, organizationName);

      expect(mockEmailTemplates.generateOrganizationInvitationAcceptedEmailTemplate).toHaveBeenCalledWith(firstName, organizationName);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: email,
        subject: 'Welcome to Test Organization on FFS',
        html: mockTemplate
      });
    });
  });
});
