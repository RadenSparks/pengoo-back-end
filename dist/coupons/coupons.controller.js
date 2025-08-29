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
exports.CouponsController = void 0;
const common_1 = require("@nestjs/common");
const coupons_service_1 = require("./coupons.service");
const create_coupon_dto_1 = require("./dto/create-coupon.dto");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_coupon_entity_1 = require("./user-coupon.entity");
const public_decorator_1 = require("../auth/public.decorator");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const update_coupon_dto_1 = require("./dto/update-coupon.dto");
let CouponsController = class CouponsController {
    couponsService;
    userCouponRepo;
    constructor(couponsService, userCouponRepo) {
        this.couponsService = couponsService;
        this.userCouponRepo = userCouponRepo;
    }
    create(dto) {
        return this.couponsService.create(dto);
    }
    validate(body, req) {
        return this.couponsService.validateAndApply(body.code, body.orderValue, req.user.id, body.productIds);
    }
    async redeemCoupon(token) {
        const userCoupon = await this.userCouponRepo.findOne({ where: { redeemToken: token }, relations: ['coupon', 'user'] });
        if (!userCoupon)
            throw new common_1.BadRequestException('Mã thông báo không hợp lệ hoặc đã hết hạn');
        if (userCoupon.redeemed)
            throw new common_1.BadRequestException('Phiếu giảm giá đã được đổi');
        userCoupon.redeemed = true;
        userCoupon.redeemedAt = new Date();
        await this.userCouponRepo.save(userCoupon);
        return { message: 'Coupon redeemed! You can now use it.', coupon: userCoupon.coupon.code };
    }
    update(id, dto) {
        return this.couponsService.update(+id, dto);
    }
    getAll() {
        return this.couponsService.getAll();
    }
    delete(id) {
        return this.couponsService.delete(id);
    }
    updateStatus(id, status) {
        return this.couponsService.updateStatus(+id, status);
    }
    async getNextMilestoneCoupon(req, userPoints) {
        const userId = req.user.id;
        const coupon = await this.couponsService.getNextAvailableCoupon(userId, Number(userPoints));
        if (!coupon)
            return { coupon: null };
        return { coupon: { code: coupon.code, discount: coupon.discountPercent } };
    }
    async getMilestoneCoupons() {
        const coupons = await this.couponsService.getMilestoneCoupons();
        return { coupons };
    }
    async getMyVouchers(req) {
        const userId = req.user.id;
        const vouchers = await this.userCouponRepo.find({
            where: { user: { id: userId } },
            relations: ['coupon'],
            order: { id: 'DESC' }
        });
        return { vouchers };
    }
    async checkVoucherByUserPoint(req, data) {
        return this.couponsService.checkVoucherByUserPoint(req.user, data.voucherCode);
    }
    async getVoucherByUserId(req) {
        return this.couponsService.getVoucherByUserId(req.user.id);
    }
    async getSpecialCollectionDiscount(body) {
        return this.couponsService.getSpecialCollectionDiscount(body.productIds);
    }
};
exports.CouponsController = CouponsController;
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new coupon' }),
    (0, swagger_1.ApiBody)({
        type: create_coupon_dto_1.CreateCouponDto,
        examples: {
            default: {
                summary: 'Create coupon',
                value: {
                    code: 'SUMMER2025',
                    minOrderValue: 100000,
                    maxOrderValue: 1000000,
                    startDate: '2025-06-01',
                    endDate: '2025-07-01',
                    usageLimit: 100,
                    discountPercent: 10,
                    status: 'active',
                    productIds: [1, 2],
                    userIds: [3, 4],
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_coupon_dto_1.CreateCouponDto]),
    __metadata("design:returntype", void 0)
], CouponsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, swagger_1.ApiBody)({
        type: create_coupon_dto_1.CreateCouponDto,
        examples: {
            default: {
                summary: 'Example product',
                value: {
                    code: "HUYDEPTRAI",
                    orderValue: 1000,
                    userId: 1,
                    product: [1, 2]
                }
            }
        }
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Validate and apply a coupon to an order' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                code: 'SUMMER2025',
                orderValue: 200000,
                userId: 3,
                productIds: [1, 2],
            },
        },
        description: 'Validate a coupon code for a user and order value',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CouponsController.prototype, "validate", null);
__decorate([
    (0, common_1.Get)('redeem'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Redeem a coupon using a token' }),
    (0, swagger_1.ApiQuery)({
        name: 'token',
        type: String,
        example: 'abc123token',
        description: 'Redemption token sent to user',
        required: true,
    }),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "redeemCoupon", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_coupon_dto_1.UpdateCouponDto]),
    __metadata("design:returntype", void 0)
], CouponsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CouponsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CouponsController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':id/:status/status'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CouponsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('next-milestone-coupon'),
    (0, swagger_1.ApiOperation)({ summary: 'Get next available coupon for user milestone' }),
    (0, swagger_1.ApiQuery)({ name: 'userPoints', type: Number, required: true }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('userPoints')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "getNextMilestoneCoupon", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('milestone-coupons'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all milestone coupons' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "getMilestoneCoupons", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my-vouchers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all vouchers owned by the current user' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "getMyVouchers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('verify-voucher'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all vouchers owned by the current user' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "checkVoucherByUserPoint", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('get-voucher-by-userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all vouchers owned by the current user' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "getVoucherByUserId", null);
__decorate([
    (0, common_1.Post)('special-collection-discount'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get special collection discount for a list of product IDs' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                productIds: [1, 2, 3]
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CouponsController.prototype, "getSpecialCollectionDiscount", null);
exports.CouponsController = CouponsController = __decorate([
    (0, swagger_1.ApiTags)('Coupons'),
    (0, common_1.Controller)('coupons'),
    __param(1, (0, typeorm_1.InjectRepository)(user_coupon_entity_1.UserCoupon)),
    __metadata("design:paramtypes", [coupons_service_1.CouponsService,
        typeorm_2.Repository])
], CouponsController);
//# sourceMappingURL=coupons.controller.js.map