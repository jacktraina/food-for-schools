
export class EmailTemplates {
  private clientUrl: string;
  private companyName: string;

  constructor(clientUrl: string, companyName: string) {
    this.clientUrl = clientUrl;
    this.companyName = companyName;
  }

  generateOrganizationInvitationAcceptedEmailTemplate(firstName: string, organizationName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Welcome to ${organizationName} on ${this.companyName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            .header {
              background-color: #2a9d8f;
              color: #ffffff;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              padding: 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 20px;
              margin: 10px 0;
              font-size: 16px;
              color: #fff;
              background-color: #2a9d8f;
              text-decoration: none;
              border-radius: 4px;
              text-align: center;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #888;
              margin-top: 30px;
            }
            .footer a {
              color: #2a9d8f;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${organizationName}!</h1>
            </div>
            <div class="content">
              <p>Hello ${firstName},</p>
              <p>Your account has been successfully created and you are now a member of ${organizationName} on ${this.companyName}.</p>
              
              <p style="text-align: center;">
                <a href="${this.clientUrl}/login" class="button">
                  Login to Your Account
                </a>
              </p>
              
              <p>You can now access all the features and resources available to your organization.</p>
              <p>If you have any questions or need assistance, please contact your organization administrator.</p>
              <p>Thanks,<br>The ${this.companyName} Team</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} ${this.companyName}. All rights reserved.<br/>
              Visit us at <a href="${this.clientUrl}">${this.clientUrl}</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  generateUserCreatedEmailTemplate(code: string, password: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Welcome to ${this.companyName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            .header {
              background-color: #2a9d8f;
              color: #ffffff;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              padding: 20px;
            }
            .code-box {
              background-color: #f1f1f1;
              border-radius: 4px;
              padding: 10px;
              font-size: 16px;
              text-align: center;
              margin: 10px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #888;
              margin-top: 30px;
            }
            .footer a {
              color: #2a9d8f;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${this.companyName}!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>We're excited to have you on board. Your account has been successfully created with the following details:</p>
              <p><strong>Password:</strong> ${password}</p>

              <p>Please use the verification code below to activate your account:</p>
              <div class="code-box">${code}</div>

              <p>If you did not sign up for this account, please ignore this email.</p>
              <p>Thanks,<br>The ${this.companyName} Team</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} ${this.companyName}. All rights reserved.<br/>
              Visit us at <a href="${this.clientUrl}">${this.clientUrl}</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  generateResetPasswordEmailTemplate(code: string, email: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            .header {
              background-color: #2a9d8f;
              color: #ffffff;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              padding: 20px;
            }
            .code-box {
              background-color: #f1f1f1;
              border-radius: 4px;
              padding: 10px;
              font-size: 16px;
              text-align: center;
              margin: 10px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #888;
              margin-top: 30px;
            }
            .footer a {
              color: #2a9d8f;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>We received a request to reset your password. Use the code below to complete the process:</p>
              <div class="code-box">${code}</div>
              <p>You can reset your password by clicking the button below:</p>
              <p style="text-align: center;">
                <a href="${this.clientUrl}/reset-password?email=${email}" style="
                  display: inline-block;
                  padding: 12px 20px;
                  margin: 10px 0;
                  font-size: 16px;
                  color: #fff;
                  background-color: #2a9d8f;
                  text-decoration: none;
                  border-radius: 4px;
                ">
                  Reset Password
                </a>
              </p>
              <p>If you did not request a password reset, please ignore this email.</p>
              <p>Thanks,<br>The ${this.companyName}  Team</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} ${this.companyName}. All rights reserved.<br/>
              Visit us at <a href="${this.clientUrl}">${this.clientUrl}</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  generateInvitationEmailTemplate(invitationLink: string, inviterName: string, fullName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>You've Been Invited to ${this.companyName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            .header {
              background-color: #2a9d8f;
              color: #ffffff;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              padding: 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 20px;
              margin: 10px 0;
              font-size: 16px;
              color: #fff;
              background-color: #2a9d8f;
              text-decoration: none;
              border-radius: 4px;
              text-align: center;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #888;
              margin-top: 30px;
            }
            .footer a {
              color: #2a9d8f;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You've Been Invited to ${this.companyName}</h1>
            </div>
            <div class="content">
              <p>Hello ${fullName},</p>
              <p>You've been invited by ${inviterName} to join ${this.companyName}. Click the button below to complete your registration:</p>
              
              <p style="text-align: center;">
                <a href="${invitationLink}" class="button">
                  Complete Registration
                </a>
              </p>
              
              <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
              <p style="word-break: break-all; background-color: #f1f1f1; padding: 10px; border-radius: 4px;">${invitationLink}</p>
              
              <p>This invitation link will expire in 7 days.</p>
              <p>If you did not expect this invitation, please ignore this email.</p>
              <p>Thanks,<br>The ${this.companyName} Team</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} ${this.companyName}. All rights reserved.<br/>
              Visit us at <a href="${this.clientUrl}">${this.clientUrl}</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  generateVerifyEmailTemplate(code: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Verify Your Email</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            .header {
              background-color: #2a9d8f;
              color: #ffffff;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              padding: 20px;
            }
            .code-box {
              background-color: #f1f1f1;
              border-radius: 4px;
              padding: 10px;
              font-size: 16px;
              text-align: center;
              margin: 10px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #888;
              margin-top: 30px;
            }
            .footer a {
              color: #2a9d8f;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Thank you for signing up! To complete your registration, please use the verification code below:</p>
              <div class="code-box">${code}</div>

              <p>If you did not sign up for this account, please ignore this email.</p>
              <p>Thanks,<br>The ${this.companyName} Team</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} ${this.companyName}s. All rights reserved.<br/>
              Visit us at <a href="${this.clientUrl}">${this.clientUrl}</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
