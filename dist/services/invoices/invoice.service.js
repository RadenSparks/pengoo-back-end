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
const order_entity_1 = require("../../orders/order.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_2 = require("@nestjs/common");
const easyinvoice_1 = require("easyinvoice");
const fs = require("fs");
const path = require("path");
const notifications_service_1 = require("../../notifications/notifications.service");
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
        if (!order) {
            throw new common_2.NotFoundException('Order not found');
        }
        const invoiceData = {
            documentTitle: 'Invoice',
            sender: {
                company: 'Pengoo Corpporation',
                address: '130/9 Dien Bien Phu Street, Binh Thanh District, Ho Chi Minh City',
                zip: '700000',
                city: 'Ho Chi Minh City',
                country: 'Vietnam',
                phone: '0937314158',
            },
            client: {
                company: order.user.full_name,
                address: order.user.address || '',
                zip: '',
                city: '',
                country: '',
                email: order.user.email,
            },
            invoiceNumber: order.id.toString(),
            invoiceDate: order.order_date.toISOString().split('T')[0],
            products: order.details.map(detail => ({
                quantity: detail.quantity.toString(),
                description: detail.product.product_name,
                price: detail.price,
                tax: 0,
            })),
            custom: [
                {
                    title: "Payment Method",
                    value: order.payment_type,
                },
                {
                    title: "Payment Status",
                    value: order.payment_status,
                }
            ],
            bottomNotice: 'Thank you for your purchase!',
        };
        const invoicesDir = path.join(process.cwd(), 'invoices');
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir);
        }
        const result = await easyinvoice_1.default.createInvoice(invoiceData);
        const invoicePath = path.join(invoicesDir, `invoice_${order.id}.pdf`);
        fs.writeFileSync(invoicePath, result.pdf, 'base64');
        await this.notificationsService.sendEmail(order.user.email, 'Your Invoice', 'Thank you for your payment. Please find your invoice attached.', invoicePath);
        return invoicePath;
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], InvoicesService);
//# sourceMappingURL=invoice.service.js.map