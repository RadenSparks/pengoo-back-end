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
    attachmentPath?: string,
    html?: string // Add this parameter
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
      html, // Add html here
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

export function pengooEmailTemplate({
  title,
  message,
  code,
  logoUrl = 'https://pengoo.store/logo.png', // Replace with your actual logo URL
}: {
  title: string;
  message: string;
  code?: string;
  logoUrl?: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 40px 0;">
    <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; overflow: hidden;">
      <div style="background: #ffe066; padding: 24px 0; text-align: center;">
        <img src="${logoUrl}" alt="Pengoo Logo" style="height: 48px; margin-bottom: 8px;" />
        <h2 style="margin: 0; color: #222;">${title}</h2>
      </div>
      <div style="padding: 32px 24px 24px 24px; color: #333;">
        <p style="font-size: 16px; margin-bottom: 24px;">${message}</p>
        ${
          code
            ? `<div style="text-align: center; margin: 32px 0;">
                <span style="display: inline-block; background: #222; color: #ffe066; font-size: 28px; letter-spacing: 6px; padding: 12px 32px; border-radius: 6px; font-weight: bold;">
                  ${code}
                </span>
              </div>`
            : ''
        }
        <p style="font-size: 13px; color: #888; margin-top: 40px;">
          Pengoo Corporation<br/>
          130/9 Dien Bien Phu Street, Binh Thanh District, Ho Chi Minh City<br/>
          Hotline: 0937314158
        </p>
      </div>
    </div>
  </div>
  `;
}
