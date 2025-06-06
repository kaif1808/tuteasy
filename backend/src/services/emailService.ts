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
  static async sendVerificationEmail(_email: string, _token: string): Promise<void> {
    return;
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(_email: string, _token: string): Promise<void> {
    return;
  }

  /**
   * Send welcome email after successful verification
   */
  static async sendWelcomeEmail(_email: string, _userRole: string): Promise<void> {
    return;
  }
} 