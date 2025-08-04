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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_service_1 = require("./payment.service");
const payment_types_1 = require("./payment.types");
const public_decorator_1 = require("../../auth/public.decorator");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async pay(orderId, method, userId, userRole) {
        return this.paymentsService.pay(orderId, method, userId, userRole);
    }
    async refundOrder(orderId, userId, userRole) {
        return this.paymentsService.refundOrder(orderId, userId, userRole);
    }
    async cancelOrder(orderId, userId, userRole) {
        return this.paymentsService.cancelOrder(orderId, userId, userRole);
    }
    async capturePaypal(orderId, userId, userRole) {
        return this.paymentsService.handlePaypalCapture(orderId, userId, userRole);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('pay/:orderId'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                method: 'paypal',
                userId: 1,
                userRole: 'user'
            }
        }
    }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)('method')),
    __param(2, (0, common_1.Body)('userId')),
    __param(3, (0, common_1.Body)('userRole')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "pay", null);
__decorate([
    (0, common_1.Post)('refund/:orderId'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                userId: 1,
                userRole: 'user'
            }
        }
    }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('userRole')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refundOrder", null);
__decorate([
    (0, common_1.Post)('cancel/:orderId'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                userId: 1,
                userRole: 'user'
            }
        }
    }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('userRole')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Post)('paypal/capture/:orderId'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                userId: 1,
                userRole: 'user'
            }
        }
    }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('userRole')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "capturePaypal", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payment_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payment.controller.js.map