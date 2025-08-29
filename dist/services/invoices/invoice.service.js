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
            throw new common_1.InternalServerErrorException('Không tìm thấy đơn hàng');
        const invoicePath = await this.createInvoicePdf(order);
        await this.notificationsService.sendEmail(order.user.email, 'Pengoo - Hóa đơn thanh toán', `Cảm ơn bạn đã thanh toán. Vui lòng xem hóa đơn đính kèm.`, invoicePath, (0, notifications_service_1.pengooEmailTemplate)({
            title: 'Hóa đơn thanh toán',
            message: `Xin chào ${order.user.full_name || order.user.email},<br><br>
          Cảm ơn bạn đã thanh toán đơn hàng tại Pengoo.<br>
          Vui lòng xem hóa đơn đính kèm.<br><br>
          Nếu có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua hotline bên dưới.`,
            logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755175429/logopengoo_tjwzhh.png',
        }));
        fs.unlink(invoicePath, () => { });
    }
    async createInvoicePdf(order) {
        const originalTotal = order.details.reduce((sum, detail) => sum + (detail.product?.product_price || 0) * detail.quantity, 0);
        const paidTotal = order.details.reduce((sum, detail) => sum + Number(detail.price) * detail.quantity, 0);
        const discountAmount = originalTotal - order.total_price;
        const couponCode = order.coupon_code || '';
        const data = {
            documentTitle: 'HÓA ĐƠN',
            currency: 'VND',
            taxNotation: 'vat',
            marginTop: 30,
            marginRight: 30,
            marginLeft: 30,
            marginBottom: 30,
            logo: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755175429/logopengoo_tjwzhh.png',
            backgroundColor: '#f4f6fb',
            headerBackground: '#6341df',
            headerTextColor: '#fff',
            tableHeaderBackgroundColor: '#ffd700',
            tableHeaderTextColor: '#222',
            tableRowBackgroundColor: '#fff',
            tableRowAlternateBackgroundColor: '#f4f6fb',
            fontSize: 13,
            sender: {
                company: 'Công ty Pengoo',
                address: '130/9 Điện Biên Phủ, Quận Bình Thạnh',
                zip: '70000',
                city: 'TP. Hồ Chí Minh',
                country: 'Việt Nam',
            },
            client: {
                company: order.user.full_name || order.user.email,
                address: order.shipping_address,
                zip: '',
                city: '',
                country: '',
            },
            invoiceNumber: String(order.order_code),
            invoiceDate: new Date(order.order_date).toLocaleDateString('vi-VN'),
            products: order.details.map((detail) => ({
                quantity: detail.quantity,
                description: detail.product?.product_name || 'Sản phẩm',
                tax: 0,
                price: Number(detail.price),
            })),
            customFields: [
                couponCode ? { name: 'Mã giảm giá', value: couponCode } : null,
                discountAmount > 0 ? { name: 'Số tiền giảm giá', value: `${discountAmount.toLocaleString('vi-VN')} VND` } : null,
                { name: 'Tổng thanh toán', value: `${order.total_price.toLocaleString('vi-VN')} VND` },
            ].filter(Boolean),
            bottomNotice: `
        <div style="font-size:16px;color:#6341df;font-weight:bold;margin-bottom:8px;">
          Cảm ơn bạn đã mua hàng tại Pengoo!
        </div>
        <div style="font-size:13px;color:#222;">
          Nếu có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua hotline: <b>0937 314 158</b>
        </div>
        <div style="margin-top:18px;">
          <span style="background:#ffd700;color:#222;padding:6px 18px;border-radius:8px;font-weight:600;">
            Địa chỉ cửa hàng: 130/9 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh
          </span>
        </div>
        <div style="margin-top:12px;font-size:12px;color:#888;">
          © ${new Date().getFullYear()} Pengoo Corporation. Mọi quyền được bảo lưu.
        </div>
      `,
        };
        const result = await easyinvoice.createInvoice(data);
        const invoiceDir = path.join('/tmp', 'invoices');
        if (!fs.existsSync(invoiceDir)) {
            fs.mkdirSync(invoiceDir, { recursive: true });
        }
        const invoicePath = path.join(invoiceDir, `hoa-don-${order.id}.pdf`);
        fs.writeFileSync(invoicePath, result.pdf, 'base64');
        return invoicePath;
    }
    async createInvoicePdfByOrderId(orderId) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['user', 'details', 'details.product'],
        });
        if (!order)
            throw new common_1.InternalServerErrorException('Không tìm thấy đơn hàng');
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