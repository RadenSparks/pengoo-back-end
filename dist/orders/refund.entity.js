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
exports.Refund = void 0;
const typeorm_1 = require("typeorm");
const payment_types_1 = require("../services/payment/payment.types");
const refund_request_entity_1 = require("./refund-request.entity");
var RefundStatus;
(function (RefundStatus) {
    RefundStatus["PROCESSING"] = "PROCESSING";
    RefundStatus["SUCCESS"] = "SUCCESS";
    RefundStatus["FAILED"] = "FAILED";
})(RefundStatus || (RefundStatus = {}));
let Refund = class Refund {
    id;
    refundRequest;
    amount;
    paymentMethod;
    toAccountNumber;
    toBin;
    bank;
    transaction_id;
    status;
    created_at;
    updated_at;
};
exports.Refund = Refund;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Refund.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => refund_request_entity_1.RefundRequest, (refundRequest) => refundRequest.refund, { eager: true }),
    __metadata("design:type", refund_request_entity_1.RefundRequest)
], Refund.prototype, "refundRequest", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal'),
    __metadata("design:type", Number)
], Refund.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Refund.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Refund.prototype, "toAccountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Refund.prototype, "toBin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Refund.prototype, "bank", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], Refund.prototype, "transaction_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar', length: 255,
        default: 'PENDING',
    }),
    __metadata("design:type", String)
], Refund.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Refund.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Refund.prototype, "updated_at", void 0);
exports.Refund = Refund = __decorate([
    (0, typeorm_1.Entity)('refunds')
], Refund);
//# sourceMappingURL=refund.entity.js.map