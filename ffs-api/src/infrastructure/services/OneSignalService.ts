import { injectable, inject } from 'inversify';
import * as OneSignal from 'onesignal-node';
import { IOneSignalServicePort } from '../../domain/core/IOneSignalServicePort';
import TYPES from '../../shared/dependencyInjection/types';

export interface OneSignalConfig {
  appId: string;
  apiKey: string;
}

@injectable()
export class OneSignalAdapter implements IOneSignalServicePort {
  private client: OneSignal.Client;
  private config: OneSignalConfig;

  constructor(
    @inject(TYPES.OneSignalConfig) config: OneSignalConfig
  ) {
    this.config = config;
    console.log('OneSignalAdapter', config.appId);
    this.client = new OneSignal.Client(config.appId, config.apiKey);
    console.log("OneSignal client initialized:", this.client);
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    body: string
  ): Promise<void> {
    try {
      const recipients = Array.isArray(to) ? to : [to];
      
      for (const email of recipients) {
        const notification = {
          app_id: this.config.appId,
          email_subject: subject,
          email_body: body,
          include_email_tokens: [email],
        };

        await this.client.createNotification(notification);
      }
      
      console.log('Email sent successfully via OneSignal');
    } catch (error) {
      console.log('Error sending email via OneSignal:', error);
      throw new Error('Failed to send email via OneSignal');
    }
  }

  async sendPushNotification(userId: string, title: string, message: string): Promise<void> {
    try {
      const notification = {
        app_id: this.client.appId,
        contents: { en: message },
        headings: { en: title },
        filters: [
          { field: 'external_user_id', value: userId }
        ]
      };

      await this.client.createNotification(notification);
      console.log('Push notification sent successfully via OneSignal');
    } catch (error) {
      console.log('Error sending push notification via OneSignal:', error);
      throw new Error('Failed to send push notification via OneSignal');
    }
  }
}
