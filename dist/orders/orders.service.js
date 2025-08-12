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
const product_entity_1 = require("../products/product.entity");
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
    constructor(payosService, ordersRepository, orderDetailsRepository, deliveryRepository, usersService, productsService, notificationsService, couponsService, invoicesService, dataSource) {
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
    }
    async create(createOrderDto) {
        const { userId, delivery_id, payment_type, shipping_address, payment_status, productStatus, details, couponCode, } = createOrderDto;
        let total_price = createOrderDto.total_price;
        const userEntity = await this.usersService.findById(userId);
        if (!userEntity) {
            throw new common_1.NotFoundException('User not found');
        }
        const delivery = await this.deliveryRepository.findOne({ where: { id: delivery_id } });
        if (!delivery)
            throw new common_1.NotFoundException('Delivery method not found');
        const orderDetails = [];
        for (const item of details) {
            const product = await this.productsService.findById(item.productId);
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${item.productId} not found`);
            }
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
            total_price = total_price - discount;
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
            total_price,
            shipping_address,
            payment_status: payment_status,
            productStatus: productStatus,
            details: orderDetails,
            order_code,
        });
        let savedOrder = await this.ordersRepository.save(order);
        savedOrder.checkout_url = checkout_url ?? null;
        await this.notificationsService.sendOrderConfirmation(userEntity.email, savedOrder.id);
        return savedOrder;
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
    async markOrderAsPaidByCode(orderCode) {
        const order = await this.ordersRepository.findOne({ where: { order_code: orderCode }, relations: ['user'] });
        if (!order)
            throw new Error('Order not found');
        order.payment_status = order_entity_1.PaymentStatus.Paid;
        await this.invoicesService.generateInvoice(order.id);
        return await this.ordersRepository.save(order);
    }
    async handleOrderCancellation(orderCode) {
        const order = await this.ordersRepository.findOne({ where: { order_code: orderCode } });
        if (!order) {
            console.warn(`Order ${orderCode} not found during cancellation.`);
            return;
        }
        order.payment_status = 'canceled';
        order.productStatus = 'canceled';
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
        const order = await this.findById(id);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        await this.ordersRepository.remove(order);
    }
    async getDelivery() {
        return this.deliveryRepository.find();
    }
    async findByPaypalOrderId(paypalOrderId) {
        return this.ordersRepository.findOne({ where: { paypal_order_id: paypalOrderId } });
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
                const product = await manager
                    .createQueryBuilder(product_entity_1.Product, 'product')
                    .setLock('pessimistic_write')
                    .where('product.id = :id', { id: detail.product.id })
                    .getOne();
                if (!product)
                    throw new common_1.NotFoundException('Product not found');
                if (product.quantity_stock < detail.quantity) {
                    throw new common_1.BadRequestException(`Not enough stock for ${product.product_name}`);
                }
                product.quantity_stock -= detail.quantity;
                product.quantity_sold += detail.quantity;
                await manager.save(product);
            }
            order.payment_status = order_entity_1.PaymentStatus.Paid;
            await manager.save(order);
        });
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
        typeorm_2.DataSource])
], OrdersService);
//# sourceMappingURL=orders.service.js.map