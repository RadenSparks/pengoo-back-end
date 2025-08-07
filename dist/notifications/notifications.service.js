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
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const path = require("path");
let NotificationsService = class NotificationsService {
    configService;
    transporter;
    from;
    constructor(configService) {
        this.configService = configService;
        const emailUser = this.configService.get('EMAIL_USER');
        if (!emailUser) {
            throw new Error('EMAIL_USER environment variable is not set');
        }
        this.from = emailUser;
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.from,
                pass: this.configService.get('EMAIL_PASS'),
            },
        });
    }
    async sendEmail(to, subject, message, attachmentPath) {
        const mailOptions = {
            from: this.from,
            to,
            subject,
            text: message,
        };
        if (attachmentPath) {
            mailOptions.attachments = [
                {
                    filename: attachmentPath.split(path.sep).pop(),
                    path: attachmentPath,
                    contentType: 'application/pdf',
                },
            ];
        }
        await this.transporter.sendMail(mailOptions);
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
//# sourceMappingURL=notifications.service.js.map