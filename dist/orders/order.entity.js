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
exports.OrderDetail = exports.Order = exports.ProductStatus = exports.PaymentStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const product_entity_1 = require("../products/product.entity");
const delivery_entity_1 = require("../delivery/delivery.entity");
const review_entity_1 = require("../reviews/review.entity");
const wishlist_entity_1 = require("../wishlist/wishlist.entity");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Paid"] = "paid";
    PaymentStatus["Pending"] = "pending";
    PaymentStatus["PendingOnDelivery"] = "pending_on_delivery";
    PaymentStatus["Refunded"] = "refunded";
    PaymentStatus["Success"] = "success";
    PaymentStatus["Canceled"] = "canceled";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["Pending"] = "pending";
    ProductStatus["Cancelled"] = "cancelled";
    ProductStatus["Shipped"] = "shipped";
    ProductStatus["Delivered"] = "delivered";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
let Order = class Order {
    id;
    user;
    delivery;
    coupon_id;
    coupon_code;
    payment_type;
    order_date;
    total_price;
    order_code;
    shipping_address;
    payment_status;
    productStatus;
    paypal_order_id;
    details;
    reviews;
    wishlistItems;
    deletedAt;
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id, { nullable: false }),
    __metadata("design:type", user_entity_1.User)
], Order.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => delivery_entity_1.Delivery, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'delivery_id' }),
    __metadata("design:type", delivery_entity_1.Delivery)
], Order.prototype, "delivery", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Order.prototype, "coupon_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Order.prototype, "coupon_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], Order.prototype, "payment_type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'date', nullable: false }),
    __metadata("design:type", Date)
], Order.prototype, "order_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: false }),
    __metadata("design:type", Number)
], Order.prototype, "total_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true, default: null }),
    __metadata("design:type", Number)
], Order.prototype, "order_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], Order.prototype, "shipping_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "payment_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "productStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Order.prototype, "paypal_order_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OrderDetail, orderDetail => orderDetail.order, { cascade: true }),
    __metadata("design:type", Array)
], Order.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, review => review.order),
    __metadata("design:type", Array)
], Order.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => wishlist_entity_1.Wishlist, wishlist => wishlist.movedToOrder),
    __metadata("design:type", Array)
], Order.prototype, "wishlistItems", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ nullable: true }),
    __metadata("design:type", Date)
], Order.prototype, "deletedAt", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)()
], Order);
let OrderDetail = class OrderDetail {
    id;
    order;
    product;
    quantity;
    price;
    get total() {
        return Number(this.price) * this.quantity;
    }
};
exports.OrderDetail = OrderDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrderDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Order, order => order.details),
    __metadata("design:type", Order)
], OrderDetail.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, product => product.id),
    __metadata("design:type", product_entity_1.Product)
], OrderDetail.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], OrderDetail.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal'),
    __metadata("design:type", Number)
], OrderDetail.prototype, "price", void 0);
exports.OrderDetail = OrderDetail = __decorate([
    (0, typeorm_1.Entity)()
], OrderDetail);
//# sourceMappingURL=order.entity.js.map