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
exports.PayosService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const crypto = require("crypto");
const invoice_service_1 = require("../invoices/invoice.service");
let PayosService = class PayosService {
    invoicesService;
    apiUrl = 'https://api-merchant.payos.vn/v2/payment-requests';
    apiKey = process.env.PAYOS_API_KEY;
    clientId = process.env.PAYOS_CLIENT_ID;
    clientSecret = process.env.PAYOS_CHECKSUM_KEY || "";
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    async createInvoice(data) {
        const { orderCode, amount, returnUrl, cancelUrl, description } = data;
        const rawData = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
        const signature = crypto
            .createHmac('sha256', this.clientSecret)
            .update(rawData)
            .digest('hex');
        const payload = {
            orderCode,
            amount,
            returnUrl,
            cancelUrl,
            description,
            signature,
        };
        try {
            const res = await axios_1.default.post(this.apiUrl, payload, {
                headers: {
                    'x-api-key': this.apiKey ?? '',
                    'x-client-id': this.clientId ?? '',
                    'Content-Type': 'application/json',
                },
            });
            return res.data;
        }
        catch (err) {
            throw new common_1.HttpException(err.response?.data || 'Lỗi khi gọi PayOS', err.response?.status || 500);
        }
    }
    async handlePayosPaymentSuccess(orderId) {
        await this.invoicesService.generateInvoice(orderId);
        return { message: 'Invoice generated and sent to user.' };
    }
};
exports.PayosService = PayosService;
exports.PayosService = PayosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [invoice_service_1.InvoicesService])
], PayosService);
//# sourceMappingURL=payos.service.js.map