"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
exports.pengooEmailTemplate = pengooEmailTemplate;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let NotificationsService = class NotificationsService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async sendEmail(to, subject, text, attachmentPath, html) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASS'),
            },
        });
        const mailOptions = {
            from: this.configService.get('EMAIL_USER'),
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
    async sendOrderConfirmation(email, orderId) {
        const subject = 'Order Confirmation';
        const message = `Your order with ID ${orderId} has been confirmed.`;
        await this.sendEmail(email, subject, message);
    }
    async sendShippingUpdate(email, orderId, status) {
        const subject = 'Shipping Update';
        const message = `Your order with ID ${orderId} is now ${status}.`;
        await this.sendEmail(email, subject, message);
    }
    async sendPasswordReset(email, token) {
        const resetUrl = `https://pengoo.store/reset-password?token=${token}`;
        const subject = 'Password Reset Request';
        const message = `You requested a password reset. Click the link to reset your password: ${resetUrl}`;
        await this.sendEmail(email, subject, message);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationsService);
function pengooEmailTemplate({ title, message, code, logoUrl = 'https://pengoo.store/logo.png', }) {
    return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; padding: 0; margin: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f6fb; padding: 0; margin: 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 12px; box-shadow: 0 4px 24px #0002; margin: 40px 0; overflow: hidden;">
            <tr>
              <td style="background: linear-gradient(90deg, #6341dfff 0%, #ffd700 100%); padding: 32px 0 16px 0; text-align: center;">
                <img src="${logoUrl}" alt="Pengoo Logo" style="height: 56px; margin-bottom: 12px;" />
                <h2 style="margin: 0; color: #222; font-size: 28px; font-weight: 700; letter-spacing: 1px;">${title}</h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 32px 24px 32px; color: #333;">
                <p style="font-size: 17px; margin-bottom: 28px; line-height: 1.6;">${message}</p>
                ${code
        ? `<div style="text-align: center; margin: 36px 0;">
                        <span style="display: inline-block; background: #222; color: #ffe066; font-size: 32px; letter-spacing: 8px; padding: 16px 40px; border-radius: 8px; font-weight: bold; box-shadow: 0 2px 8px #0001;">
                          ${code}
                        </span>
                      </div>`
        : ''}
                <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 24px 0;" />
                <p style="font-size: 13px; color: #888; margin-top: 0; text-align: center;">
                  Pengoo Corporation<br/>
                  130/9 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh<br/>
                  <span style="color: #222;">Hotline: <b>0937 314 158</b></span>
                </p>
                <div style="margin-top: 24px; text-align: center;">
                  <a href="https://pengoo.store/" style="display: inline-block; background: #ffe066; color: #222; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 6px; box-shadow: 0 2px 8px #0001; font-size: 16px;">
                    Truy cập Pengoo Store
                  </a>
                </div>
              </td>
            </tr>
          </table>
          <div style="font-size: 12px; color: #aaa; margin-top: 16px; text-align: center;">
            © ${new Date().getFullYear()} Pengoo Corporation. All rights reserved.
          </div>
        </td>
      </tr>
    </table>
  </div>
  `;
}
//# sourceMappingURL=notifications.service.js.map