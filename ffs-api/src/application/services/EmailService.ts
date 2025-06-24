import { injectable } from 'inversify';
import { IEmailService } from '../contracts/IEmailService';
import { EmailTemplates } from '../../shared/emailTemplates/EmailTemplates';
import nodemailer from 'nodemailer';
import { config } from '../../config/env';

@injectable()
export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;
  private emailTemplates: EmailTemplates;
  private fromEmail: string;
  private clientUrl: string;
  private companyName: string;

  constructor() {
    this.fromEmail = config.emailFrom || 'noreply@example.com';
    this.clientUrl = config.clientUrl || 'http://localhost:3000';
    this.companyName = config.companyName || 'FFS';

    this.emailTemplates = new EmailTemplates(this.clientUrl, this.companyName);

    this.transporter = nodemailer.createTransport({
      host: config.emailHost,
      port: parseInt(config.emailPort || '587'),
      secure: config.emailSecure === 'true',
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: `Reset Your ${this.companyName} Password`,
      html: this.emailTemplates.generateResetPasswordEmailTemplate(code, email),
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendUserCreatedEmail(email: string, code: string, password: string): Promise<void> {
    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: `Welcome to ${this.companyName}`,
      html: this.emailTemplates.generateUserCreatedEmailTemplate(code, password),
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendInvitationEmail(email: string, invitationLink: string, inviterName: string, fullName: string): Promise<void> {
    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: `You've Been Invited to ${this.companyName}`,
      html: this.emailTemplates.generateInvitationEmailTemplate(invitationLink, inviterName, fullName),
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: `Verify Your ${this.companyName} Email`,
      html: this.emailTemplates.generateVerifyEmailTemplate(code),
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOrganizationInvitationAcceptedEmail(email: string, firstName: string, organizationName: string): Promise<void> {
    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: `Welcome to ${organizationName} on ${this.companyName}`,
      html: this.emailTemplates.generateOrganizationInvitationAcceptedEmailTemplate(firstName, organizationName),
    };

    await this.transporter.sendMail(mailOptions);
  }
}
