import nodemailer from 'nodemailer';
import { IEmailServicePort } from '../../../../src/domain/core/IEmailServicePort';
import { EmailConfig, NodemailerAdapter } from '../../../../src/infrastructure/services/NodemailerService';

// Mock nodemailer
jest.mock('nodemailer');

describe('NodemailerAdapter', () => {
  let adapter: IEmailServicePort;
  let mockTransporter: {
    sendMail: jest.Mock;
  };
  const mockConfig: EmailConfig = {
    host: 'smtp.example.com',
    port: 465,
    secure: true,
    auth: {
      user: 'test@example.com',
      pass: 'password123'
    }
  };

  beforeEach(() => {
    // Create mock transporter
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
    };

    // Mock nodemailer.createTransport
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    // Create adapter instance
    adapter = new NodemailerAdapter(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a transporter with the provided config', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: mockConfig.host,
        port: mockConfig.port,
        secure: mockConfig.secure,
        auth: mockConfig.auth
      });
    });
  });

  describe('sendEmail', () => {
    const testEmail = 'recipient@example.com';
    const testSubject = 'Test Subject';
    const testBody = '<p>Test Body</p>';

    it('should send email with correct parameters', async () => {
      await adapter.sendEmail(testEmail, testSubject, testBody);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfig.auth.user,
        to: testEmail,
        subject: testSubject,
        html: testBody,
        attachments: undefined
      });
    });

    it('should handle multiple recipients', async () => {
      const recipients = ['recipient1@example.com', 'recipient2@example.com'];
      await adapter.sendEmail(recipients, testSubject, testBody);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfig.auth.user,
        to: recipients,
        subject: testSubject,
        html: testBody,
        attachments: undefined
      });
    });

    it('should handle attachments', async () => {
      const attachments = [
        { filename: 'test.txt', content: 'test content' },
        { filename: 'image.png', content: Buffer.from('test') }
      ];

      await adapter.sendEmail(testEmail, testSubject, testBody, attachments);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: mockConfig.auth.user,
        to: testEmail,
        subject: testSubject,
        html: testBody,
        attachments: attachments
      });
    });

    it('should log success on successful send', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      await adapter.sendEmail(testEmail, testSubject, testBody);

      expect(consoleSpy).toHaveBeenCalledWith('Email sent successfully');
      consoleSpy.mockRestore();
    });

    it('should throw error when send fails', async () => {
      const error = new Error('SMTP error');
      mockTransporter.sendMail.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'log');

      await expect(adapter.sendEmail(testEmail, testSubject, testBody))
        .rejects
        .toThrow('Failed to send email');

      expect(consoleSpy).toHaveBeenCalledWith('Error sending email:', error);
      consoleSpy.mockRestore();
    });

    it('should use the configured from address', async () => {
      await adapter.sendEmail(testEmail, testSubject, testBody);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: mockConfig.auth.user
        })
      );
    });
  });

  describe('error cases', () => {
    it('should throw error if transporter fails to create', () => {
      (nodemailer.createTransport as jest.Mock).mockImplementation(() => {
        throw new Error('Transport creation failed');
      });

      expect(() => new NodemailerAdapter(mockConfig))
        .toThrow('Transport creation failed');
    });
  });
});