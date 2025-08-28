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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../orders/order.entity");
const payment_types_1 = require("./payment.types");
const paypal_service_1 = require("../paypal/paypal.service");
const payos_service_1 = require("../payos/payos.service");
const invoice_service_1 = require("../invoices/invoice.service");
let PaymentsService = class PaymentsService {
    ordersRepository;
    paypalService;
    dataSource;
    payosService;
    invoicesService;
    constructor(ordersRepository, paypalService, dataSource, payosService, invoicesService) {
        this.ordersRepository = ordersRepository;
        this.paypalService = paypalService;
        this.dataSource = dataSource;
        this.payosService = payosService;
        this.invoicesService = invoicesService;
    }
    async assertCanAct(userId, order, userRole) {
        if (order.user.id !== userId && userRole !== 'admin') {
            throw new common_1.ForbiddenException('Bạn không được phép thực hiện hành động này theo lệnh này.');
        }
    }
    async pay(orderId, method, userId, userRole) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['user'],
        });
        if (!order)
            throw new common_1.BadRequestException('Không tìm thấy đơn hàng');
        await this.assertCanAct(userId, order, userRole);
        if (order.payment_status === order_entity_1.PaymentStatus.Paid) {
            throw new common_1.BadRequestException('Đơn hàng đã được thanh toán.');
        }
        if (order.payment_status === order_entity_1.PaymentStatus.PendingOnDelivery && method === payment_types_1.PaymentMethod.ON_DELIVERY) {
            throw new common_1.BadRequestException('Đơn đặt hàng đã được đặt để thanh toán khi giao hàng.');
        }
        if (order.productStatus === 'cancelled') {
            throw new common_1.BadRequestException('Không thể thanh toán cho đơn hàng bị hủy.');
        }
        switch (method) {
            case payment_types_1.PaymentMethod.PAYPAL:
                order.payment_status = order_entity_1.PaymentStatus.Pending;
                await this.ordersRepository.save(order);
                return this.paypalService.createOrder(orderId);
            case payment_types_1.PaymentMethod.ON_DELIVERY:
                order.payment_status = order_entity_1.PaymentStatus.PendingOnDelivery;
                await this.ordersRepository.save(order);
                return { message: 'Order placed. Pay on delivery.' };
            default:
                throw new common_1.BadRequestException('Phương thức thanh toán không được hỗ trợ');
        }
    }
    async handlePaypalCapture(orderId, userId, userRole) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['user'],
        });
        if (!order)
            throw new common_1.BadRequestException('Không tìm thấy đơn hàng');
        await this.assertCanAct(userId, order, userRole);
        if (order.payment_status === order_entity_1.PaymentStatus.Paid) {
            return { message: 'Order is already paid.' };
        }
        if (order.productStatus === 'cancelled') {
            throw new common_1.BadRequestException('Không thể thu hồi khoản thanh toán cho đơn hàng bị hủy.');
        }
        order.payment_status = order_entity_1.PaymentStatus.Paid;
        await this.ordersRepository.save(order);
        await this.invoicesService.generateInvoice(orderId);
        return { message: 'Payment captured, order marked as paid, and invoice sent.' };
    }
    async handlePayosCapture(orderId, userId, userRole) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['user'],
        });
        if (!order)
            throw new common_1.BadRequestException('Không tìm thấy đơn hàng');
        await this.assertCanAct(userId, order, userRole);
        if (order.payment_status === order_entity_1.PaymentStatus.Paid) {
            throw new common_1.BadRequestException('Đơn hàng đã được thanh toán.');
        }
        if (order.productStatus === 'cancelled') {
            throw new common_1.BadRequestException('Không thể thu hồi khoản thanh toán cho đơn hàng bị hủy.');
        }
        order.payment_status = order_entity_1.PaymentStatus.Paid;
        await this.ordersRepository.save(order);
        await this.invoicesService.generateInvoice(orderId);
        return { message: 'Khoản thanh toán Payos đã được ghi lại và hóa đơn đã được gửi.' };
    }
    async refundOrder(orderId, userId, userRole) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['user'],
        });
        if (!order)
            throw new common_1.BadRequestException('Không tìm thấy đơn hàng');
        await this.assertCanAct(userId, order, userRole);
        if (order.payment_status !== order_entity_1.PaymentStatus.Paid) {
            throw new common_1.BadRequestException('Đơn đặt hàng chưa được thanh toán hoặc đã được hoàn lại.');
        }
        if (order.productStatus === 'cancelled') {
            throw new common_1.BadRequestException('Đơn đặt hàng đã bị hủy.');
        }
        await this.dataSource.transaction(async (manager) => {
            if (order.payment_type === payment_types_1.PaymentMethod.PAYPAL) {
                await this.paypalService.refundOrder(order.id);
            }
            if (order.payment_type === payment_types_1.PaymentMethod.PAYOS) {
                await this.payosService.refundOrder(order.order_code);
            }
            order.payment_status = order_entity_1.PaymentStatus.Refunded;
            order.productStatus = 'cancelled';
            await manager.save(order);
        });
        return { message: 'Order refunded and cancelled.' };
    }
    async cancelOrder(orderId, userId, userRole) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['user'],
        });
        if (!order)
            throw new common_1.BadRequestException('Không tìm thấy đơn hàng');
        await this.assertCanAct(userId, order, userRole);
        if (order.productStatus === 'cancelled') {
            throw new common_1.BadRequestException('Đơn đặt hàng đã bị hủy.');
        }
        if (order.payment_status === order_entity_1.PaymentStatus.Paid) {
            await this.refundOrder(orderId, userId, userRole);
            return { message: 'Đơn hàng bị hủy và được hoàn tiền.' };
        }
        order.productStatus = 'cancelled';
        await this.ordersRepository.save(order);
        return { message: 'Order cancelled.' };
    }
    async markOrderAsPaid(orderId, userId, userRole) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['user'],
        });
        if (!order)
            throw new common_1.BadRequestException('Không tìm thấy đơn hàng');
        await this.assertCanAct(userId, order, userRole);
        if (order.payment_status === order_entity_1.PaymentStatus.Paid) {
            throw new common_1.BadRequestException('Đơn hàng đã được thanh toán.');
        }
        order.payment_status = order_entity_1.PaymentStatus.Paid;
        await this.ordersRepository.save(order);
        await this.invoicesService.generateInvoice(orderId);
        return { message: 'Đơn hàng được đánh dấu là đã thanh toán và đã gửi hóa đơn.' };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        paypal_service_1.PaypalService,
        typeorm_2.DataSource,
        payos_service_1.PayosService,
        invoice_service_1.InvoicesService])
], PaymentsService);
//# sourceMappingURL=payment.service.js.map