import * as sgMail from '@sendgrid/mail';
import { config } from '../config';

// Initialize SendGrid with API key
if (config.sendgrid?.apiKey) {
  sgMail.setApiKey(config.sendgrid.apiKey);
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = config.sendgrid?.fromEmail || 'noreply@tuteasy.com';
  private static readonly FROM_NAME = 'TutEasy';

  /**
   * Send a generic email
   */
  static async sendEmail(options: EmailOptions): Promise<void> {
    if (!config.sendgrid?.apiKey) {
      console.warn('SendGrid API key not configured. Email not sent:', options.subject);
      return;
    }

    try {
      const msg = {
        to: options.to,
        from: {
          email: this.FROM_EMAIL,
          name: this.FROM_NAME,
        },
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await sgMail.send(msg);
      console.log(`Email sent successfully to ${options.to}: ${options.subject}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send email verification email
   */
  static async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${config.frontend?.url || 'http://localhost:5173'}/verify-email?token=${token}`;
    
    const subject = 'Verify Your Email Address - TutEasy';
    
    const text = `
Welcome to TutEasy!

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with TutEasy, please ignore this email.

Best regards,
The TutEasy Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - TutEasy</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to TutEasy!</h1>
  </div>
  <div class="content">
    <h2>Verify Your Email Address</h2>
    <p>Thank you for joining TutEasy! To complete your registration and start connecting with tutors or students, please verify your email address.</p>
    
    <p style="text-align: center;">
      <a href="${verificationUrl}" class="button" style="color: white;">Verify Email Address</a>
    </p>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">
      ${verificationUrl}
    </p>
    
    <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
    
    <div class="footer">
      <p>If you didn't create an account with TutEasy, please ignore this email.</p>
      <p>Best regards,<br>The TutEasy Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.frontend?.url || 'http://localhost:5173'}/reset-password?token=${token}`;
    
    const subject = 'Reset Your Password - TutEasy';
    
    const text = `
Password Reset Request

We received a request to reset your password for your TutEasy account.

To reset your password, click the link below:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The TutEasy Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - TutEasy</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
    .warning { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Password Reset Request</h1>
  </div>
  <div class="content">
    <h2>Reset Your Password</h2>
    <p>We received a request to reset your password for your TutEasy account.</p>
    
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button" style="color: white;">Reset Password</a>
    </p>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">
      ${resetUrl}
    </p>
    
    <div class="warning">
      <strong>⚠️ Security Notice:</strong> This reset link will expire in 1 hour for your security.
    </div>
    
    <div class="footer">
      <p><strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
      <p>For your security, never share this link with anyone.</p>
      <p>Best regards,<br>The TutEasy Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  /**
   * Send welcome email after successful verification
   */
  static async sendWelcomeEmail(email: string, userRole: string): Promise<void> {
    const dashboardUrl = `${config.frontend?.url || 'http://localhost:5173'}/dashboard`;
    
    const subject = 'Welcome to TutEasy - Let\'s Get Started!';
    
    const roleSpecificContent = userRole === 'TUTOR' 
      ? {
          title: 'Welcome to TutEasy - Start Teaching Today!',
          content: 'Complete your tutor profile to start connecting with students and begin your teaching journey.',
          cta: 'Complete Your Profile',
        }
      : {
          title: 'Welcome to TutEasy - Find Your Perfect Tutor!',
          content: 'Explore our network of qualified tutors and find the perfect match for your learning goals.',
          cta: 'Find Tutors',
        };

    const text = `
Welcome to TutEasy!

Your email has been successfully verified and your account is now active.

${roleSpecificContent.content}

Get started by visiting your dashboard: ${dashboardUrl}

We're excited to have you as part of the TutEasy community!

Best regards,
The TutEasy Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TutEasy</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
    .success { background-color: #d1fae5; border: 1px solid #059669; border-radius: 4px; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${roleSpecificContent.title}</h1>
  </div>
  <div class="content">
    <div class="success">
      <strong>✅ Email Verified Successfully!</strong> Your account is now active.
    </div>
    
    <h2>You're All Set!</h2>
    <p>${roleSpecificContent.content}</p>
    
    <p style="text-align: center;">
      <a href="${dashboardUrl}" class="button" style="color: white;">${roleSpecificContent.cta}</a>
    </p>
    
    <h3>What's Next?</h3>
    <ul>
      ${userRole === 'TUTOR' 
        ? `
          <li>Complete your tutor profile with subjects and qualifications</li>
          <li>Set your hourly rates and availability</li>
          <li>Upload profile photo and introduction video</li>
          <li>Start receiving student requests</li>
        `
        : `
          <li>Browse and filter tutors by subject and location</li>
          <li>Read reviews and ratings from other students</li>
          <li>Book sessions that fit your schedule</li>
          <li>Start your learning journey</li>
        `
      }
    </ul>
    
    <div class="footer">
      <p>Need help getting started? Contact our support team at support@tuteasy.com</p>
      <p>We're excited to have you as part of the TutEasy community!</p>
      <p>Best regards,<br>The TutEasy Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }
} 