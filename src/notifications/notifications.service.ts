import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private configService: ConfigService) {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    if (!emailUser) {
      throw new Error('EMAIL_USER environment variable is not set');
    }
    this.from = emailUser;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.from,
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendEmail(to: string, subject: string, message: string, attachmentPath?: string) {
    const mailOptions: any = {
      from: this.from,
      to,
      subject,
      text: message,
    };

    if (attachmentPath) {
      mailOptions.attachments = [
        {
          filename: attachmentPath.split(path.sep).pop(), // Get file name from path
          path: attachmentPath,
          contentType: 'application/pdf',
        },
      ];
    }

    await this.transporter.sendMail(mailOptions);
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
