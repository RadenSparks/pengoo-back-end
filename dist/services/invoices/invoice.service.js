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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("../../notifications/notifications.service");
const order_entity_1 = require("../../orders/order.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const fs = require("fs");
const path = require("path");
const easyinvoice = require("easyinvoice");
let InvoicesService = class InvoicesService {
    ordersRepository;
    notificationsService;
    constructor(ordersRepository, notificationsService) {
        this.ordersRepository = ordersRepository;
        this.notificationsService = notificationsService;
    }
    async generateInvoice(orderId) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['user', 'details', 'details.product'],
        });
        if (!order)
            throw new common_1.InternalServerErrorException('Order not found');
        const invoicePath = await this.createInvoicePdf(order);
        await this.notificationsService.sendEmail(order.user.email, 'Pengoo - Your Invoice', `Thank you for your payment. Please find your invoice attached.`, invoicePath, (0, notifications_service_1.pengooEmailTemplate)({
            title: 'Your Invoice',
            message: `Dear ${order.user.full_name || order.user.email},<br><br>
          Thank you for your payment. Please find your invoice attached.<br><br>
          If you have any questions, contact us at the hotline below.`,
            logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755174794/logonav_ck9fwi.png',
        }));
        fs.unlink(invoicePath, () => { });
    }
    async createInvoicePdf(order) {
        const data = {
            documentTitle: 'INVOICE',
            currency: 'VND',
            taxNotation: 'vat',
            marginTop: 25,
            marginRight: 25,
            marginLeft: 25,
            marginBottom: 25,
            logo: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755174794/logonav_ck9fwi.png',
            sender: {
                company: 'Pengoo Corporation',
                address: '130/9 Dien Bien Phu Street, Binh Thanh District',
                zip: '70000',
                city: 'Ho Chi Minh City',
                country: 'Vietnam',
            },
            client: {
                company: order.user.full_name || order.user.email,
                address: order.shipping_address,
                zip: '',
                city: '',
                country: '',
            },
            invoiceNumber: String(order.order_code),
            invoiceDate: new Date(order.order_date).toLocaleDateString('en-GB'),
            products: order.details.map((detail) => ({
                quantity: detail.quantity,
                description: detail.product?.product_name || 'Product',
                tax: 0,
                price: detail.product?.product_price || 0,
            })),
            bottomNotice: 'Thank you for your purchase!',
        };
        const result = await easyinvoice.createInvoice(data);
        const invoiceDir = path.join('/tmp', 'invoices');
        if (!fs.existsSync(invoiceDir)) {
            fs.mkdirSync(invoiceDir, { recursive: true });
        }
        const invoicePath = path.join(invoiceDir, `invoice-${order.id}.pdf`);
        fs.writeFileSync(invoicePath, result.pdf, 'base64');
        return invoicePath;
    }
    async createInvoicePdfByOrderId(orderId) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['user', 'details', 'details.product'],
        });
        if (!order)
            throw new common_1.InternalServerErrorException('Order not found');
        return this.createInvoicePdf(order);
    }
    async getOrderWithDetails(orderId) {
        return this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['user', 'details', 'details.product'],
        });
    }
    canDownloadInvoice(order) {
        if (order.payment_type === 'cod' && order.payment_status !== 'paid') {
            return false;
        }
        if (order.payment_status !== 'paid') {
            return false;
        }
        return true;
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        notifications_service_1.NotificationsService])
], InvoicesService);
//# sourceMappingURL=invoice.service.js.map