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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
const public_decorator_1 = require("../auth/public.decorator");
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async sendEmail(body) {
        if (!body.to || !body.subject || !body.message) {
            throw new common_1.BadRequestException('Thiếu các trường bắt buộc: đến, chủ đề, tin nhắn');
        }
        await this.notificationsService.sendEmail(body.to, body.subject, body.message);
        return { message: 'Email sent.' };
    }
    async sendOrderConfirmation(body) {
        if (!body.email || !body.orderId) {
            throw new common_1.BadRequestException('Thiếu các trường bắt buộc: email, orderId');
        }
        await this.notificationsService.sendOrderConfirmation(body.email, body.orderId);
        return { message: 'Order confirmation email sent.' };
    }
    async sendShippingUpdate(body) {
        if (!body.email || !body.orderId || !body.status) {
            throw new common_1.BadRequestException('Thiếu các trường bắt buộc: email, orderId, trạng thái');
        }
        await this.notificationsService.sendShippingUpdate(body.email, body.orderId, body.status);
        return { message: 'Đã gửi email cập nhật vận chuyển.' };
    }
    async sendPasswordReset(body) {
        if (!body.email || !body.token) {
            throw new common_1.BadRequestException('Thiếu các trường bắt buộc: email, token');
        }
        await this.notificationsService.sendPasswordReset(body.email, body.token);
        return {
            message: 'Đã gửi email đặt lại mật khẩu.'
        };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)('send-email'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                to: 'recipient@example.com',
                subject: 'Test Email',
                message: 'This is a test email sent from the API.',
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('order-confirmation'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                email: 'customer@example.com',
                orderId: 1234,
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendOrderConfirmation", null);
__decorate([
    (0, common_1.Post)('shipping-update'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                email: 'customer@example.com',
                orderId: 1234,
                status: 'shipped',
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendShippingUpdate", null);
__decorate([
    (0, common_1.Post)('password-reset'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                email: 'user@example.com',
                token: 'reset-token-from-email',
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendPasswordReset", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map