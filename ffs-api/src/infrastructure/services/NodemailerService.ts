import { injectable, inject } from 'inversify';
import nodemailer, { Transporter } from 'nodemailer';
import { IEmailServicePort } from '../../domain/core/IEmailServicePort';
import TYPES from '../../shared/dependencyInjection/types';

// Create an interface for your email config
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

@injectable()
export class NodemailerAdapter implements IEmailServicePort {
  private transporter: Transporter;

  constructor(
    @inject(TYPES.EmailConfig) private readonly config: EmailConfig
  ) {
    console.log('NodemailerAdapter', config.auth)
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth
    });
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    body: string,
    attachments?: { filename: string; content: Buffer | string }[]
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.auth.user,
        to: to,
        subject: subject,
        html: body,
        attachments: attachments,
      });
      console.log('Email sent successfully');
    } catch (error) {
      console.log('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}