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
  <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 40px 0;">
    <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; overflow: hidden;">
      <div style="background: #ffe066; padding: 24px 0; text-align: center;">
        <img src="${logoUrl}" alt="Pengoo Logo" style="height: 48px; margin-bottom: 8px;" />
        <h2 style="margin: 0; color: #222;">${title}</h2>
      </div>
      <div style="padding: 32px 24px 24px 24px; color: #333;">
        <p style="font-size: 16px; margin-bottom: 24px;">${message}</p>
        ${code
        ? `<div style="text-align: center; margin: 32px 0;">
                <span style="display: inline-block; background: #222; color: #ffe066; font-size: 28px; letter-spacing: 6px; padding: 12px 32px; border-radius: 6px; font-weight: bold;">
                  ${code}
                </span>
              </div>`
        : ''}
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
//# sourceMappingURL=notifications.service.js.map