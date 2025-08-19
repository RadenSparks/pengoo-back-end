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
exports.User = void 0;
const review_entity_1 = require("../reviews/review.entity");
const wishlist_entity_1 = require("../wishlist/wishlist.entity");
const typeorm_1 = require("typeorm");
const ticket_earning_log_entity_1 = require("../minigame/ticket-earning-log.entity");
const user_coupon_entity_1 = require("../coupons/user-coupon.entity");
const refund_request_entity_1 = require("../orders/refund-request.entity");
let User = class User {
    id;
    username;
    full_name;
    password;
    email;
    role;
    phone_number;
    avatar_url;
    status;
    address;
    points;
    minigame_tickets;
    resetPasswordToken;
    resetPasswordExpires;
    reviews;
    wishlists;
    ticketEarningLogs;
    userCoupons;
    refundRequests;
    lastFreeTicketClaim;
    mfaCode;
    mfaCodeExpires;
    provider;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, unique: true, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "full_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: false, default: 'user' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatar_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "points", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 3 }),
    __metadata("design:type", Number)
], User.prototype, "minigame_tickets", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "resetPasswordToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "resetPasswordExpires", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, review => review.user),
    __metadata("design:type", Array)
], User.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => wishlist_entity_1.Wishlist, wishlist => wishlist.user),
    __metadata("design:type", Array)
], User.prototype, "wishlists", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ticket_earning_log_entity_1.TicketEarningLog, log => log.user),
    __metadata("design:type", Array)
], User.prototype, "ticketEarningLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_coupon_entity_1.UserCoupon, uc => uc.user),
    __metadata("design:type", Array)
], User.prototype, "userCoupons", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => refund_request_entity_1.RefundRequest, rf => rf.order),
    __metadata("design:type", Array)
], User.prototype, "refundRequests", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "lastFreeTicketClaim", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "mfaCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "mfaCodeExpires", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'local' }),
    __metadata("design:type", String)
], User.prototype, "provider", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('user')
], User);
//# sourceMappingURL=user.entity.js.map