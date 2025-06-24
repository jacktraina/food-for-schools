export interface IEmailServicePort {
  sendEmail(
    to: string | string[],
    subject: string,
    body: string,
    attachments?: { filename: string; content: Buffer | string }[]
  ): Promise<void>;
}