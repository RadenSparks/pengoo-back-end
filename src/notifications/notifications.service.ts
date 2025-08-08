import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

@Injectable()
export class NotificationsService {
  constructor(private configService: ConfigService) {}

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    attachmentPath?: string
  ) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    const mailOptions: any = {
      from: this.configService.get<string>('EMAIL_USER'),
      to,
      subject,
      text,
    };

    if (attachmentPath) {
      mailOptions.attachments = [
        {
          filename: attachmentPath.split('/').pop(),
          path: attachmentPath,
        },
      ];
    }

    await transporter.sendMail(mailOptions);
  }

  async sendOrderConfirmation(email: string, orderId: number) {
    const subject = 'Order Confirmation';
    const message = `Your order with ID ${orderId} has been confirmed.`;
    await this.sendEmail(email, subject, message);
  }

  async sendShippingUpdate(email: string, orderId: number, status: string) {
    const subject = 'Shipping Update';
    const message = `Your order with ID ${orderId} is now ${status}.`;
    await this.sendEmail(email, subject, message);
  }

  async sendPasswordReset(email: string, token: string) {
    const resetUrl = `https://pengoo.store/reset-password?token=${token}`;
    const subject = 'Password Reset Request';
    const message = `You requested a password reset. Click the link to reset your password: ${resetUrl}`;
    await this.sendEmail(email, subject, message);
  }
}
