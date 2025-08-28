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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./order.entity");
const users_service_1 = require("../users/users.service");
const products_service_1 = require("../products/products.service");
const notifications_service_1 = require("../notifications/notifications.service");
const delivery_entity_1 = require("../delivery/delivery.entity");
const coupons_service_1 = require("../coupons/coupons.service");
const payos_service_1 = require("../services/payos/payos.service");
const invoice_service_1 = require("../services/invoices/invoice.service");
const product_entity_1 = require("../products/entities/product.entity");
const refund_request_entity_1 = require("./refund-request.entity");
const file_entity_1 = require("./file.entity");
const config_1 = require("@nestjs/config");
const cloudinary_service_1 = require("../services/cloudinary/cloudinary.service");
let OrdersService = class OrdersService {
    payosService;
    ordersRepository;
    orderDetailsRepository;
    deliveryRepository;
    usersService;
    productsService;
    notificationsService;
    couponsService;
    invoicesService;
    dataSource;
    configService;
    cloudinaryService;
    constructor(payosService, ordersRepository, orderDetailsRepository, deliveryRepository, usersService, productsService, notificationsService, couponsService, invoicesService, dataSource, configService, cloudinaryService) {
        this.payosService = payosService;
        this.ordersRepository = ordersRepository;
        this.orderDetailsRepository = orderDetailsRepository;
        this.deliveryRepository = deliveryRepository;
        this.usersService = usersService;
        this.productsService = productsService;
        this.notificationsService = notificationsService;
        this.couponsService = couponsService;
        this.invoicesService = invoicesService;
        this.dataSource = dataSource;
        this.configService = configService;
        this.cloudinaryService = cloudinaryService;
    }
    async create(createOrderDto) {
        return await this.dataSource.transaction(async (manager) => {
            const { userId, delivery_id, payment_type, shipping_address, payment_status, productStatus, details, couponCode, phoneNumber } = createOrderDto;
            let total_price = createOrderDto.total_price;
            const userEntity = await this.usersService.findById(userId);
            if (!userEntity) {
                throw new common_1.NotFoundException('User not found');
            }
            const delivery = await this.deliveryRepository.findOne({ where: { id: delivery_id } });
            if (!delivery)
                throw new common_1.NotFoundException('Delivery method not found');
            const orderDetails = [];
            for (const item of createOrderDto.details) {
                const product = await manager
                    .createQueryBuilder(product_entity_1.Product, 'product')
                    .setLock('pessimistic_write')
                    .where('product.id = :id', { id: item.productId })
                    .getOne();
                if (!product)
                    throw new common_1.NotFoundException(`Product with ID ${item.productId} not found`);
                if (product.quantity_stock < item.quantity) {
                    throw new common_1.BadRequestException({
                        message: `Not enough stock for ${product.product_name}`,
                        productId: product.id,
                        requested: item.quantity,
                        available: product.quantity_stock,
                        allowPartial: product.quantity_stock > 0,
                    });
                }
                product.quantity_stock -= item.quantity;
                await manager.save(product);
                const orderDetail = this.orderDetailsRepository.create({
                    product,
                    quantity: item.quantity,
                    price: item.price,
                });
                orderDetails.push(orderDetail);
            }
            let coupon_id = null;
            let coupon_code = null;
            if (couponCode) {
                const { coupon, discount } = await this.couponsService.validateAndApply(couponCode, total_price, userId, details.map(d => d.productId));
                console.log(discount, total_price);
                coupon_id = coupon.id;
                coupon_code = coupon.code;
            }
            let order_code = null;
            let checkout_url = null;
            if (payment_type === "payos") {
                const data = await this.createOrderPayOS(2000);
                order_code = data.order_code;
                checkout_url = data.checkout_url;
            }
            const order = this.ordersRepository.create({
                user: userEntity,
                delivery,
                coupon_id,
                coupon_code,
                payment_type,
                phone_number: phoneNumber,
                total_price,
                shipping_address,
                payment_status: payment_status,
                productStatus: productStatus,
                details: orderDetails,
                order_code,
            });
            console.log(total_price);
            const savedOrder = await manager.save(order);
            savedOrder.checkout_url = checkout_url ?? null;
            if (order.user && order.user.email) {
                await this.notificationsService.sendOrderConfirmation(order.user.email, order.id);
            }
            for (const detail of createOrderDto.details) {
                const product = await manager.findOne(product_entity_1.Product, { where: { id: detail.productId } });
                if (!product)
                    throw new common_1.NotFoundException(`Product ${detail.productId} not found`);
                if (product.quantity_stock < detail.quantity) {
                    throw new common_1.BadRequestException(`Not enough stock for product ${product.product_name}`);
                }
                product.quantity_sold += detail.quantity;
                product.quantity_stock -= detail.quantity;
                await manager.save(product);
            }
            return savedOrder;
        });
    }
    generateSafeOrderCode = () => {
        const min = 1000000000000;
        const max = 9007199254740991;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    async createOrderPayOS(amount) {
        const order_code = Math.floor(this.generateSafeOrderCode());
        const checkout = {
            orderCode: +(order_code),
            amount: 2000,
            description: "Thanh toán đơn hàng",
            cancelUrl: "https://pengoo.store/order/cancel",
            returnUrl: "https://pengoo.store/order/success"
        };
        const result = await this.payosService.createInvoice(checkout);
        return { checkout_url: result.data.checkoutUrl, order_code };
    }
    async findAll() {
        return this.ordersRepository.find({ relations: ['user', 'details', 'details.product', 'delivery', 'details.product.images'] });
    }
    async findById(orderId) {
        return this.ordersRepository.findOne({ where: { id: orderId } });
    }
    async findByUserId(id) {
        return this.ordersRepository.find({
            where: { user: { id } },
            relations: ['user', 'details', 'details.product', 'delivery', 'details.product.images'],
            order: { id: 'DESC' }
        });
    }
    async findByOrderCode(order_code) {
        return this.ordersRepository.findOne({ where: { order_code } });
    }
    async markOrderAsPaidByCode(orderCode) {
        const order = await this.ordersRepository.findOne({ where: { order_code: orderCode }, relations: ['user'] });
        if (!order)
            throw new Error('Order not found');
        order.payment_status = order_entity_1.PaymentStatus.Paid;
        order.productStatus = order_entity_1.ProductStatus.Pending;
        await this.invoicesService.generateInvoice(order.id);
        return await this.ordersRepository.save(order);
    }
    async handleOrderCancellation(orderCode) {
        const order = await this.ordersRepository.findOne({ where: { order_code: orderCode } });
        console.log(`Handling cancellation for order code: ${order?.order_code}`);
        if (!order) {
            return new common_1.NotFoundException('Order not found');
        }
        order.payment_status = order_entity_1.PaymentStatus.Canceled;
        order.productStatus = order_entity_1.ProductStatus.Cancelled;
        return await this.ordersRepository.save(order);
    }
    async updateStatus(id, updateOrderStatusDto) {
        const order = await this.findById(id);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        order.productStatus = updateOrderStatusDto.productStatus;
        return this.ordersRepository.save(order);
    }
    async remove(id) {
        await this.ordersRepository.softDelete(id);
    }
    async restore(id) {
        await this.ordersRepository.restore(id);
    }
    async getDelivery() {
        return this.deliveryRepository.find();
    }
    async findByPaypalOrderId(paypalOrderId) {
        return this.ordersRepository.findOne({
            where: { paypal_order_id: paypalOrderId },
            relations: ['user'],
        });
    }
    async save(order) {
        return this.ordersRepository.save(order);
    }
    async completeOrder(orderId) {
        await this.dataSource.transaction(async (manager) => {
            const order = await manager.findOne(order_entity_1.Order, { where: { id: orderId }, relations: ['details', 'details.product'] });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
            for (const detail of order.details) {
                const product = await this.productsService.findById(detail.product.id);
                if (product) {
                    product.quantity_sold += detail.quantity;
                    product.quantity_stock -= detail.quantity;
                    await this.productsService.save(product);
                }
            }
            order.payment_status = order_entity_1.PaymentStatus.Paid;
            await manager.save(order);
        });
    }
    async createRefundRequest(data) {
        const refundRequest = await this.dataSource.transaction(async (manager) => {
            const order = await manager.findOne(order_entity_1.Order, {
                where: { id: data.order_id },
                relations: ['details', 'details.product', 'refundRequests', 'user'],
            });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
            if (order.productStatus !== order_entity_1.ProductStatus.Delivered) {
                throw new common_1.BadRequestException('Refunds can only be requested for delivered orders.');
            }
            const deliveredAt = order.order_date;
            const REFUND_WINDOW_DAYS = 14;
            const now = new Date();
            const deliveredDate = new Date(deliveredAt);
            if ((now.getTime() - deliveredDate.getTime()) > REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000) {
                throw new common_1.BadRequestException('Refund period has expired.');
            }
            const previousRequests = order.refundRequests || [];
            const pendingRequest = previousRequests.find(r => r.status === refund_request_entity_1.RefundRequestStatus.PENDING);
            if (pendingRequest) {
                throw new common_1.BadRequestException('There is already a pending refund request for this order.');
            }
            if (previousRequests.length >= 3) {
                throw new common_1.BadRequestException('You have reached the maximum number of refund requests for this order.');
            }
            const dropdownReasons = ['defective', 'missing', 'wrong'];
            if (!data.reason ||
                (!dropdownReasons.includes(data.reason) &&
                    data.reason.trim().length < 10)) {
                throw new common_1.BadRequestException('Please provide a detailed reason for your refund request (at least 10 characters for custom reasons).');
            }
            let refundAmount = order.total_price;
            if (order.payment_status === order_entity_1.PaymentStatus.Refunded) {
                throw new common_1.BadRequestException('This order has already been refunded.');
            }
            const refundRequest = manager.create(refund_request_entity_1.RefundRequest, {
                order,
                reason: data.reason,
                user: { id: data.user_id },
                amount: order.total_price,
                toAccountNumber: data.toAccountNumber,
                toBin: data.toBin,
                bank: data.bank,
                paymentMethod: data.paymentMethod,
                times: (order.refundRequests?.length ?? 0) + 1,
                status: refund_request_entity_1.RefundRequestStatus.PENDING,
            });
            await manager.save(refundRequest);
            if (Array.isArray(data.uploadFiles)) {
                for (const file of data.uploadFiles) {
                    const uploadFile = manager.create(file_entity_1.UploadFiles, {
                        refundRequest,
                        type: file.type,
                        url: file.url,
                    });
                    await manager.save(uploadFile);
                }
            }
            const adminUsers = await manager.find('User', { where: { role: 'admin', status: true } });
            const adminEmails = adminUsers
                .map((user) => user.email)
                .filter((email) => !!email);
            if (adminEmails.length === 0) {
                adminEmails.push(this.configService.get('ADMIN_EMAIL') || 'admin@pengoo.store');
            }
            const subject = `Refund Request #${refundRequest.id} Created`;
            const message = `
        A new refund request has been created.<br>
        <b>Order ID:</b> ${order.id}<br>
        <b>User:</b> ${order.user?.email || 'Unknown'}<br>
        <b>Reason:</b> ${refundRequest.reason}<br>
        <b>Amount:</b> ${refundRequest.amount}<br>
        <b>Time:</b> ${new Date().toLocaleString()}<br>
      `;
            const auditLog = `
        [AUDIT] Refund request created for order ${order.id} by user ${data.user_id}<br>
        <b>Order ID:</b> ${order.id}<br>
        <b>User ID:</b> ${data.user_id}<br>
        <b>User Email:</b> ${order.user?.email || 'Unknown'}<br>
        <b>Reason:</b> ${refundRequest.reason}<br>
        <b>Amount:</b> ${refundRequest.amount}<br>
        <b>Time:</b> ${new Date().toLocaleString()}<br>
      `;
            for (const email of adminEmails) {
                await this.notificationsService.sendEmail(email, `Audit Log: Refund Request #${refundRequest.id}`, `[AUDIT] Refund request created for order ${order.id} by user ${data.user_id}`, undefined, auditLog);
            }
            console.log(`[AUDIT] Refund request created for order ${order.id} by user ${data.user_id}`);
            return refundRequest;
        });
        return {
            status: 200,
            message: 'Refund request created successfully.',
            data: refundRequest,
            estimatedProcessingTime: '3-7 business days',
        };
    }
    async cancelOversoldOrders() {
        const orders = await this.ordersRepository.find({ relations: ['details', 'details.product', 'user'] });
        for (const order of orders) {
            let canFulfill = true;
            for (const detail of order.details) {
                if (detail.product.quantity_stock < detail.quantity) {
                    canFulfill = false;
                    break;
                }
            }
            if (!canFulfill && order.productStatus !== order_entity_1.ProductStatus.Cancelled) {
                order.productStatus = order_entity_1.ProductStatus.Cancelled;
                order.payment_status = order_entity_1.PaymentStatus.Canceled;
                await this.ordersRepository.save(order);
                await this.notificationsService.sendEmail(order.user.email, 'Order Cancelled Due to Insufficient Stock', `Your order #${order.id} has been cancelled because we do not have enough stock to fulfill it. Please contact us for alternatives or a refund.`);
            }
        }
        return { status: 'done' };
    }
    async updateAddress(id, newAddress, phoneNumber) {
        const order = await this.findById(id);
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        order.shipping_address = newAddress;
        order.phone_number = phoneNumber;
        return this.ordersRepository.save(order);
    }
    async getRefundRequests() {
        return this.dataSource.getRepository(refund_request_entity_1.RefundRequest).find({
            relations: ['user', 'order', 'uploadFiles'],
            order: { created_at: 'DESC' },
        });
    }
    async updateRefundRequestStatus(id, status) {
        const refundRequestRepo = this.dataSource.getRepository(refund_request_entity_1.RefundRequest);
        const refundRequest = await refundRequestRepo.findOne({ where: { id } });
        if (!refundRequest)
            throw new common_1.NotFoundException('Refund request not found');
        refundRequest.status = status;
        await refundRequestRepo.save(refundRequest);
        return { status: 200, message: 'Refund request status updated', data: refundRequest };
    }
    async processRefundRequest(id) {
        const refundRequestRepo = this.dataSource.getRepository(refund_request_entity_1.RefundRequest);
        const refundRequest = await refundRequestRepo.findOne({ where: { id } });
        if (!refundRequest)
            throw new common_1.NotFoundException('Refund request not found');
        refundRequest.status = refund_request_entity_1.RefundRequestStatus.REFUNDED;
        await refundRequestRepo.save(refundRequest);
        return { status: 200, message: 'Refund request marked as refunded', data: refundRequest };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.OrderDetail)),
    __param(3, (0, typeorm_1.InjectRepository)(delivery_entity_1.Delivery)),
    __metadata("design:paramtypes", [payos_service_1.PayosService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        products_service_1.ProductsService,
        notifications_service_1.NotificationsService,
        coupons_service_1.CouponsService,
        invoice_service_1.InvoicesService,
        typeorm_2.DataSource,
        config_1.ConfigService,
        cloudinary_service_1.CloudinaryService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map