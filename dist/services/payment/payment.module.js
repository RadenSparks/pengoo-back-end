"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payment_service_1 = require("./payment.service");
const payment_controller_1 = require("./payment.controller");
const order_entity_1 = require("../../orders/order.entity");
const users_module_1 = require("../../users/users.module");
const orders_module_1 = require("../../orders/orders.module");
const invoices_module_1 = require("../invoices/invoices.module");
const payos_module_1 = require("../payos/payos.module");
const notifications_module_1 = require("../../notifications/notifications.module");
const paypal_module_1 = require("../paypal/paypal.module");
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order]),
            users_module_1.UsersModule,
            orders_module_1.OrdersModule,
            invoices_module_1.InvoicesModule,
            payos_module_1.PayosModule,
            notifications_module_1.NotificationsModule,
            paypal_module_1.PaypalModule,
        ],
        providers: [payment_service_1.PaymentsService],
        controllers: [payment_controller_1.PaymentsController],
        exports: [payment_service_1.PaymentsService],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map