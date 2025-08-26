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
exports.RefundRequest = exports.RefundRequestStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const order_entity_1 = require("./order.entity");
const file_entity_1 = require("./file.entity");
const refund_entity_1 = require("./refund.entity");
const payment_types_1 = require("../services/payment/payment.types");
var RefundRequestStatus;
(function (RefundRequestStatus) {
    RefundRequestStatus["PENDING"] = "PENDING";
    RefundRequestStatus["APPROVED"] = "APPROVED";
    RefundRequestStatus["REJECTED"] = "REJECTED";
})(RefundRequestStatus || (exports.RefundRequestStatus = RefundRequestStatus = {}));
let RefundRequest = class RefundRequest {
    id;
    order;
    user;
    uploadFiles;
    refund;
    amount;
    reason;
    times;
    status;
    created_at;
    updated_at;
    paymentMethod;
    toAccountNumber;
    toBin;
    bank;
};
exports.RefundRequest = RefundRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RefundRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.Order, (order) => order.refundRequests, { eager: true }),
    __metadata("design:type", order_entity_1.Order)
], RefundRequest.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.refundRequests, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], RefundRequest.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => file_entity_1.UploadFiles, (uploadFile) => uploadFile.refundRequest),
    __metadata("design:type", Array)
], RefundRequest.prototype, "uploadFiles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => refund_entity_1.Refund, (refund) => refund.refundRequest),
    __metadata("design:type", Array)
], RefundRequest.prototype, "refund", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], RefundRequest.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], RefundRequest.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)('int2'),
    __metadata("design:type", Number)
], RefundRequest.prototype, "times", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, default: RefundRequestStatus.PENDING }),
    __metadata("design:type", String)
], RefundRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RefundRequest.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RefundRequest.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, default: 'cod' }),
    __metadata("design:type", String)
], RefundRequest.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], RefundRequest.prototype, "toAccountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], RefundRequest.prototype, "toBin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], RefundRequest.prototype, "bank", void 0);
exports.RefundRequest = RefundRequest = __decorate([
    (0, typeorm_1.Entity)('refund_requests')
], RefundRequest);
//# sourceMappingURL=refund-request.entity.js.map