export interface IEmailService {
  sendPasswordResetEmail(email: string, code: string): Promise<void>;
  sendUserCreatedEmail(email: string, code: string, password: string): Promise<void>;
  sendInvitationEmail(email: string, invitationLink: string, inviterName: string, fullName: string): Promise<void>;
  sendVerificationEmail(email: string, code: string): Promise<void>;
  sendOrganizationInvitationAcceptedEmail(email: string, firstName: string, organizationName: string): Promise<void>;
}
