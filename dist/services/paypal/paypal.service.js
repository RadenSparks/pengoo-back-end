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
const node_fetch_1 = require("node-fetch");
const orders_service_1 = require("../../orders/orders.service");
const config_1 = require("@nestjs/config");
const invoice_service_1 = require("../invoices/invoice.service");
const order_entity_1 = require("../../orders/order.entity");
let PaypalService = class PaypalService {
    ordersService;
    configService;
    invoicesService;
    clientId;
    clientSecret;
    apiBase;
    constructor(ordersService, configService, invoicesService) {
        this.ordersService = ordersService;
        this.configService = configService;
        this.invoicesService = invoicesService;
        this.clientId = this.configService.get('PAYPAL_CLIENT_ID') ?? '';
        if (!this.clientId) {
            throw new Error('PAYPAL_CLIENT_ID is not defined in environment variables');
        }
        this.clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET') ?? '';
        if (!this.clientSecret) {
            throw new Error('PAYPAL_CLIENT_SECRET is not defined in environment variables');
        }
        this.apiBase = this.configService.get('PAYPAL_API_BASE') || 'https://api-m.sandbox.paypal.com';
    }
    async getAccessToken() {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const res = await (0, node_fetch_1.default)(`${this.apiBase}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });
        if (!res.ok)
            throw new common_1.InternalServerErrorException('Failed to get PayPal access token');
        const data = await res.json();
        return data.access_token;
    }
    async createOrder(orderId) {
        const order = await this.ordersService.findById(orderId);
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const accessToken = await this.getAccessToken();
        const body = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'VND',
                        value: order.total_price.toString(),
                    },
                },
            ],
            application_context: {
                return_url: `https://pengoo.store/checkout/paypal-success?orderId=${orderId}`,
                cancel_url: `https://pengoo.store/checkout/paypal-cancel?orderId=${orderId}`,
            },
        };
        const res = await (0, node_fetch_1.default)(`${this.apiBase}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!res.ok)
            throw new common_1.InternalServerErrorException('Failed to create PayPal order');
        const data = await res.json();
        order.paypal_order_id = data.id;
        await this.ordersService.save(order);
        const approvalUrl = data.links.find((link) => link.rel === 'approve')?.href;
        return { paypalOrderId: data.id, approvalUrl };
    }
    async captureOrder(paypalOrderId) {
        const accessToken = await this.getAccessToken();
        const res = await (0, node_fetch_1.default)(`${this.apiBase}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok)
            throw new common_1.InternalServerErrorException('Failed to capture PayPal order');
        const data = await res.json();
        const order = await this.ordersService.findByPaypalOrderId(paypalOrderId);
        if (order) {
            order.payment_status = order_entity_1.PaymentStatus.Paid;
            await this.ordersService.save(order);
            await this.invoicesService.generateInvoice(order.id);
        }
        return data;
    }
    async refundOrder(orderId) {
        const order = await this.ordersService.findById(orderId);
        if (!order || !order.paypal_order_id) {
            throw new common_1.NotFoundException('Order or PayPal order ID not found');
        }
        const accessToken = await this.getAccessToken();
        const orderRes = await (0, node_fetch_1.default)(`${this.apiBase}/v2/checkout/orders/${order.paypal_order_id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        if (!orderRes.ok)
            throw new common_1.InternalServerErrorException('Failed to fetch PayPal order details');
        const orderData = await orderRes.json();
        const captureId = orderData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
        if (!captureId)
            throw new common_1.InternalServerErrorException('PayPal capture ID not found');
        const refundRes = await (0, node_fetch_1.default)(`${this.apiBase}/v2/payments/captures/${captureId}/refund`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });
        if (!refundRes.ok)
            throw new common_1.InternalServerErrorException('Failed to refund PayPal payment');
        return;
    }
};
exports.PaypalService = PaypalService;
exports.PaypalService = PaypalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        config_1.ConfigService,
        invoice_service_1.InvoicesService])
], PaypalService);
//# sourceMappingURL=paypal.service.js.map