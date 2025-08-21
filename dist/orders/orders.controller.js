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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const orders_service_1 = require("./orders.service");
const update_orders_status_dto_1 = require("./update-orders-status.dto");
const create_orders_dto_1 = require("./create-orders.dto");
const public_decorator_1 = require("../auth/public.decorator");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const common_2 = require("@nestjs/common");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    createOrder(createOrderDto) {
        return this.ordersService.create(createOrderDto);
    }
    updateOrderStatus(id, updateOrderStatusDto) {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            throw new common_1.BadRequestException('Order ID must be an integer');
        }
        return this.ordersService.updateStatus(parsedId, updateOrderStatusDto);
    }
    findAllOrders() {
        return this.ordersService.findAll();
    }
    getDelivery() {
        return this.ordersService.getDelivery();
    }
    findOrderById(id) {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            throw new common_1.BadRequestException('Order ID must be an integer');
        }
        return this.ordersService.findById(parsedId);
    }
    findOrderByOrderCode(order_code) {
        return this.ordersService.findByOrderCode(+(order_code));
    }
    async handleOrderSuccess(query) {
        const { orderCode } = query;
        return await this.ordersService.markOrderAsPaidByCode(+orderCode);
    }
    async handleOrderCancel(query) {
        const { orderCode } = query;
        const data = await this.ordersService.handleOrderCancellation(+orderCode);
        console.log(data);
        return data;
    }
    removeOrder(id) {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            throw new common_1.BadRequestException('Order ID must be an integer');
        }
        return this.ordersService.remove(parsedId);
    }
    async restore(id) {
        await this.ordersService.restore(id);
        return { message: 'Order restored successfully.' };
    }
    async createRefundRequest(body, files) {
        return await this.ordersService.createRefundRequest(body, files);
    }
    async cancelOversoldOrders() {
        return await this.ordersService.cancelOversoldOrders();
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        type: create_orders_dto_1.CreateOrderDto,
        examples: {
            default: {
                summary: 'Create a new order',
                value: {
                    userId: 1,
                    delivery_id: 2,
                    payment_type: 'paypal',
                    total_price: 100,
                    shipping_address: '123 Main St, City, Country',
                    payment_status: 'pending',
                    productStatus: 'pending',
                    couponCode: 'SUMMER2024',
                    details: [
                        {
                            productId: 10,
                            quantity: 2,
                            price: 30
                        },
                        {
                            productId: 12,
                            quantity: 1,
                            price: 40
                        }
                    ]
                }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_orders_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBody)({
        type: update_orders_status_dto_1.UpdateOrderStatusDto,
        examples: {
            default: {
                summary: 'Update order status',
                value: {
                    productStatus: 'shipped'
                }
            }
        }
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_orders_status_dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findAllOrders", null);
__decorate([
    (0, common_1.Get)('/delivery'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getDelivery", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findOrderById", null);
__decorate([
    (0, common_1.Get)('order-code/:order_code'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('order_code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findOrderByOrderCode", null);
__decorate([
    (0, common_1.Post)('payos/order-success'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "handleOrderSuccess", null);
__decorate([
    (0, common_1.Post)('payos/order-cancel'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "handleOrderCancel", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "removeOrder", null);
__decorate([
    (0, common_1.Put)(':id/restore'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "restore", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('refund-request'),
    (0, common_2.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_2.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_orders_dto_1.CreateRefundRequestDto, Array]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createRefundRequest", null);
__decorate([
    (0, common_1.Post)('cancel-oversold'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancelOversoldOrders", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map