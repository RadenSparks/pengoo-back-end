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
exports.PaypalController = void 0;
const common_1 = require("@nestjs/common");
const paypal_service_1 = require("./paypal.service");
let PaypalController = class PaypalController {
    paypalService;
    constructor(paypalService) {
        this.paypalService = paypalService;
    }
    async createPaypalOrder(orderId) {
        return this.paypalService.createOrder(orderId);
    }
    async capturePaypalOrder(paypalOrderId) {
        return this.paypalService.captureOrder(paypalOrderId);
    }
};
exports.PaypalController = PaypalController;
__decorate([
    (0, common_1.Post)('create-order/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PaypalController.prototype, "createPaypalOrder", null);
__decorate([
    (0, common_1.Post)('capture-order/:paypalOrderId'),
    __param(0, (0, common_1.Param)('paypalOrderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaypalController.prototype, "capturePaypalOrder", null);
exports.PaypalController = PaypalController = __decorate([
    (0, common_1.Controller)('payments/paypal'),
    __metadata("design:paramtypes", [paypal_service_1.PaypalService])
], PaypalController);
//# sourceMappingURL=paypal.controller.js.map