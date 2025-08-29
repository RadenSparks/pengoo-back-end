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
exports.PaypalService = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("../../orders/orders.service");
const config_1 = require("@nestjs/config");
const invoice_service_1 = require("../invoices/invoice.service");
const order_entity_1 = require("../../orders/order.entity");
const paypal = require("@paypal/checkout-server-sdk");
const notifications_service_1 = require("../../notifications/notifications.service");
let PaypalService = class PaypalService {
    ordersService;
    configService;
    invoicesService;
    notificationsService;
    environment;
    client;
    constructor(ordersService, configService, invoicesService, notificationsService) {
        this.ordersService = ordersService;
        this.configService = configService;
        this.invoicesService = invoicesService;
        this.notificationsService = notificationsService;
        const clientId = this.configService.get('PAYPAL_CLIENT_ID');
        const clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET');
        const apiBase = this.configService.get('PAYPAL_API_BASE');
        const isLive = apiBase?.includes('paypal.com') && !apiBase?.includes('sandbox');
        this.environment = isLive
            ? new paypal.core.LiveEnvironment(clientId, clientSecret)
            : new paypal.core.SandboxEnvironment(clientId, clientSecret);
        this.client = new paypal.core.PayPalHttpClient(this.environment);
    }
    async createOrder(orderId) {
        const order = await this.ordersService.findById(orderId);
        if (!order)
            throw new common_1.NotFoundException('Không tìm thấy đơn hàng');
        const usdAmount = convertVndToUsd(order.total_price);
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: usdAmount.toString(),
                    },
                },
            ],
            application_context: {
                return_url: `https://pengoo.store/checkout/paypal-success?order_id=${orderId}`,
                cancel_url: `https://pengoo.store/checkout/paypal-cancel?order_id=${orderId}`,
            },
        });
        try {
            const response = await this.client.execute(request);
            const paypalOrderId = response.result.id;
            order.paypal_order_id = paypalOrderId;
            await this.ordersService.save(order);
            const approvalUrl = response.result.links.find((link) => link.rel === 'approve')?.href;
            return { paypalOrderId, approvalUrl };
        }
        catch (err) {
            throw new common_1.InternalServerErrorException('Không tạo được đơn hàng PayPal');
        }
    }
    async captureOrder(paypalOrderId) {
        const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
        request.requestBody({});
        try {
            const response = await this.client.execute(request);
            const order = await this.ordersService.findByPaypalOrderId(paypalOrderId);
            if (order) {
                if (order.payment_status !== order_entity_1.PaymentStatus.Paid) {
                    order.payment_status = order_entity_1.PaymentStatus.Paid;
                    await this.ordersService.save(order);
                    await this.invoicesService.generateInvoice(order.id);
                    await this.notificationsService.sendOrderConfirmation(order.user.email, order.id);
                }
            }
            return response.result;
        }
        catch (err) {
            throw new common_1.InternalServerErrorException('Không thể xác nhận thanh toán PayPal');
        }
    }
    async refundOrder(orderId) {
        const order = await this.ordersService.findById(orderId);
        if (!order || !order.paypal_order_id) {
            throw new common_1.NotFoundException('Không tìm thấy đơn hàng hoặc ID đơn hàng PayPal');
        }
        const getOrderRequest = new paypal.orders.OrdersGetRequest(order.paypal_order_id);
        let captureId;
        try {
            const orderRes = await this.client.execute(getOrderRequest);
            captureId = orderRes.result.purchase_units?.[0]?.payments?.captures?.[0]?.id;
        }
        catch {
            throw new common_1.InternalServerErrorException('Không tìm nạp được chi tiết đơn hàng PayPal');
        }
        if (!captureId)
            throw new common_1.InternalServerErrorException('Không tìm thấy ID giao dịch PayPal');
        const refundRequest = new paypal.payments.CapturesRefundRequest(captureId);
        refundRequest.requestBody({});
        try {
            const refundRes = await this.client.execute(refundRequest);
            order.payment_status = order_entity_1.PaymentStatus.Refunded;
            order.productStatus = 'cancelled';
            await this.ordersService.save(order);
            return refundRes.result;
        }
        catch {
            throw new common_1.InternalServerErrorException('Không thể hoàn trả khoản thanh toán PayPal');
        }
    }
};
exports.PaypalService = PaypalService;
exports.PaypalService = PaypalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        config_1.ConfigService,
        invoice_service_1.InvoicesService,
        notifications_service_1.NotificationsService])
], PaypalService);
function convertVndToUsd(vnd, rate = 25000) {
    return +(vnd / rate).toFixed(2);
}
//# sourceMappingURL=paypal.service.js.map