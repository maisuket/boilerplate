import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const appUrl = this.configService.get<string>('appUrl');

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to our platform!',
        template: 'welcome',
        context: {
          name,
          email,
          appUrl,
          loginUrl: `${appUrl}/login`,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string,
  ): Promise<void> {
    const appUrl = this.configService.get<string>('appUrl');
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request',
        template: 'reset-password',
        context: {
          name,
          email,
          resetUrl,
          expiresIn: '1 hour',
          appUrl,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw error;
    }
  }

  async sendGenericEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }
}
