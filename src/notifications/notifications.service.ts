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
    html?: string
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
      html,
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
    const subject = 'Xác nhận đơn hàng từ Pengoo';
    const message = `Đơn hàng của bạn với mã số <b>${orderId}</b> đã được xác nhận. Cảm ơn bạn đã mua sắm tại Pengoo!`;
    await this.sendEmail(
      email,
      subject,
      `Đơn hàng của bạn với mã số ${orderId} đã được xác nhận.`,
      undefined,
      pengooEmailTemplate({
        title: 'Xác nhận đơn hàng',
        message,
        logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755174794/logonav_ck9fwi.png',
      })
    );
  }

  async sendShippingUpdate(email: string, orderId: number, status: string) {
    const subject = 'Cập nhật trạng thái vận chuyển';
    const message = `Đơn hàng <b>${orderId}</b> của bạn hiện đang ở trạng thái: <b>${status}</b>.`;
    await this.sendEmail(
      email,
      subject,
      `Đơn hàng ${orderId} hiện đang ở trạng thái: ${status}.`,
      undefined,
      pengooEmailTemplate({
        title: 'Cập nhật vận chuyển',
        message,
        logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755174794/logonav_ck9fwi.png',
      })
    );
  }

  async sendPasswordReset(email: string, token: string) {
    const resetUrl = `https://pengoo.store/reset-password?token=${token}`;
    const subject = 'Yêu cầu đặt lại mật khẩu';
    const message = `Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào nút bên dưới để đặt lại mật khẩu của bạn.<br><br>
      <a href="${resetUrl}" style="display:inline-block;background:#6341df;color:#fff;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:16px;margin-top:12px;">Đặt lại mật khẩu</a>
      <br><br>Nếu bạn không yêu cầu, hãy bỏ qua email này.`;
    await this.sendEmail(
      email,
      subject,
      `Bạn vừa yêu cầu đặt lại mật khẩu. Truy cập: ${resetUrl}`,
      undefined,
      pengooEmailTemplate({
        title: 'Đặt lại mật khẩu',
        message,
        logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755174794/logonav_ck9fwi.png',
      })
    );
  }
}

export function pengooEmailTemplate({
  title,
  message,
  code,
  logoUrl = 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755174794/logonav_ck9fwi.png',
}: {
  title: string;
  message: string;
  code?: string;
  logoUrl?: string;
}) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; padding: 0; margin: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f6fb; padding: 0; margin: 0;">
      <tr>
        <td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 18px; box-shadow: 0 8px 32px #0003; margin: 48px 0; overflow: hidden;">
            <tr>
              <td style="background: linear-gradient(90deg, #6341df 0%, #ffd700 100%); padding: 40px 0 20px 0; text-align: center;">
                <img src="${logoUrl}" alt="Pengoo Logo" style="height: 88px; margin-bottom: 18px; filter: drop-shadow(0 4px 12px #6341df55);" />
                <h2 style="margin: 0; color: #222; font-size: 32px; font-weight: 800; letter-spacing: 1.5px; text-shadow: 0 2px 8px #fff8;">${title}</h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 40px 28px 40px; color: #333;">
                <p style="font-size: 19px; margin-bottom: 32px; line-height: 1.7;">${message}</p>
                ${
                  code
                    ? `<div style="text-align: center; margin: 40px 0;">
                        <span style="display: inline-block; background: #222; color: #ffe066; font-size: 36px; letter-spacing: 10px; padding: 18px 48px; border-radius: 10px; font-weight: bold; box-shadow: 0 4px 16px #0002;">
                          ${code}
                        </span>
                      </div>`
                    : ''
                }
                <hr style="border: none; border-top: 1px solid #eee; margin: 36px 0 28px 0;" />
                <p style="font-size: 14px; color: #888; margin-top: 0; text-align: center;">
                  Pengoo Corporation<br/>
                  130/9 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh<br/>
                  <span style="color: #222;">Hotline: <b>0937 314 158</b></span>
                </p>
                <div style="margin-top: 28px; text-align: center;">
                  <a href="https://pengoo.store/" style="display: inline-block; background: linear-gradient(90deg, #ffd700 0%, #6341df 100%); color: #222; font-weight: 700; text-decoration: none; padding: 14px 38px; border-radius: 8px; box-shadow: 0 2px 12px #ffd70055; font-size: 18px; letter-spacing: 1px; transition: background 0.2s;">
                    Truy cập Pengoo Store
                  </a>
                </div>
              </td>
            </tr>
          </table>
          <div style="font-size: 13px; color: #aaa; margin-top: 20px; text-align: center;">
            © ${new Date().getFullYear()} Pengoo Corporation. All rights reserved.
          </div>
        </td>
      </tr>
    </table>
  </div>
  `;
}
