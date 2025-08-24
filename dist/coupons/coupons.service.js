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
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coupon_entity_1 = require("./coupon.entity");
const user_coupon_entity_1 = require("./user-coupon.entity");
let CouponsService = class CouponsService {
    couponsRepo;
    userCouponRepo;
    constructor(couponsRepo, userCouponRepo) {
        this.couponsRepo = couponsRepo;
        this.userCouponRepo = userCouponRepo;
    }
    async create(dto) {
        const coupon = this.couponsRepo.create({
            ...dto,
            status: dto.status
        });
        return this.couponsRepo.save(coupon);
    }
    async validateAndApply(code, orderValue, userId, productIds) {
        const coupon = await this.couponsRepo.findOne({
            where: { code: (0, typeorm_2.ILike)(code) },
        });
        if (!coupon)
            throw new common_1.NotFoundException('Coupon not found');
        const voucherId = coupon.id;
        const existing = await this.userCouponRepo.createQueryBuilder("user_coupon")
            .where("user_coupon.userId = :userId", { userId })
            .andWhere("user_coupon.couponId = :voucherId", { voucherId })
            .getOne();
        console.log(userId, coupon);
        if (!existing)
            throw new common_1.BadRequestException("User hasn't redeem a voucher");
        const now = new Date();
        console.log(now);
        if (coupon.status !== coupon_entity_1.CouponStatus.Active)
            throw new common_1.BadRequestException('Coupon is not active');
        if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate))
            throw new common_1.BadRequestException('Coupon is not valid at this time');
        if (orderValue < Number(coupon.minOrderValue))
            throw new common_1.BadRequestException('Order value not eligible for this coupon');
        if (coupon.usedCount >= coupon.usageLimit)
            throw new common_1.BadRequestException('Coupon usage limit reached');
        let discount = (orderValue * Number(coupon.discountPercent)) / 100;
        if (discount > coupon.maxOrderValue) {
            discount = coupon.maxOrderValue;
        }
        await this.couponsRepo.save(coupon);
        return { coupon, discount };
    }
    async findActiveCoupon() {
        const coupon = await this.couponsRepo.findOne({
            where: { status: coupon_entity_1.CouponStatus.Active },
            order: { id: 'ASC' },
        });
        return coupon ?? undefined;
    }
    async getAll() {
        const coupon = await this.couponsRepo.find();
        return coupon ?? undefined;
    }
    async getNextAvailableCoupon(userId, userPoints) {
        const nextCoupon = await this.couponsRepo.createQueryBuilder("coupon")
            .where("coupon.milestonePoints > :userPoints", { userPoints })
            .andWhere("coupon.status = :status", { status: coupon_entity_1.CouponStatus.Active })
            .orderBy("coupon.milestonePoints", "ASC")
            .getOne();
        return nextCoupon ?? null;
    }
    async getMilestoneCoupons() {
        return this.couponsRepo.find({
            where: { milestonePoints: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()), status: coupon_entity_1.CouponStatus.Active },
            order: { milestonePoints: 'ASC' },
        });
    }
    async update(id, dto) {
        const coupon = await this.couponsRepo.findOne({
            where: { id }
        });
        if (!coupon)
            throw new common_1.NotFoundException('Coupon not found');
        Object.assign(coupon, dto);
        return this.couponsRepo.save(coupon);
    }
    async updateStatus(id, status) {
        const coupon = await this.couponsRepo.findOne({ where: { id } });
        if (!coupon)
            throw new common_1.NotFoundException('Coupon not found');
        coupon.status = status;
        return this.couponsRepo.save(coupon);
    }
    async delete(id) {
        const coupon = await this.couponsRepo.findOne({ where: { id } });
        if (!coupon)
            throw new common_1.NotFoundException('Coupon not found');
        return this.couponsRepo.remove(coupon);
    }
    async checkVoucherByUserPoint(user, voucherCode) {
        const point = user.points;
        const isActive = await this.couponsRepo.createQueryBuilder("coupon")
            .where("coupon.milestonePoints <= :point", { point })
            .andWhere("coupon.status = :status", { status: coupon_entity_1.CouponStatus.Active })
            .andWhere("coupon.code = :voucherCode", { voucherCode })
            .getOne();
        if (!isActive)
            throw new common_1.NotFoundException('Coupon not found');
        await this.handleSaveCouponForUser(user.id, isActive.id);
        return await this.getVoucherByUserId(user.id);
    }
    async handleSaveCouponForUser(userId, voucherId) {
        const existing = await this.userCouponRepo.createQueryBuilder("user_coupon")
            .where("user_coupon.userId = :userId", { userId })
            .andWhere("user_coupon.redeemed = :redeemed", { redeemed: true })
            .andWhere("user_coupon.couponId = :voucherId", { voucherId })
            .getOne();
        if (existing)
            throw new common_1.BadRequestException("User has redeem a voucher");
        const userCoupon = this.userCouponRepo.create({
            user: { id: userId },
            coupon: { id: voucherId },
            redeemed: true,
            redeemToken: null,
        });
        return await this.userCouponRepo.save(userCoupon);
    }
    async getVoucherByUserId(id) {
        return this.userCouponRepo.find({
            where: {
                user: { id },
                coupon: { status: coupon_entity_1.CouponStatus.Active },
            },
            relations: ['coupon'],
        });
    }
    async remove(id) {
        await this.couponsRepo.softDelete(id);
        return { deleted: true };
    }
    async restore(id) {
        await this.couponsRepo.restore(id);
        return { restored: true };
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __param(1, (0, typeorm_1.InjectRepository)(user_coupon_entity_1.UserCoupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map