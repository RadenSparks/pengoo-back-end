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
const product_entity_1 = require("../products/entities/product.entity");
const collection_entity_1 = require("../collections/collection.entity");
const products_service_1 = require("../products/products.service");
let CouponsService = class CouponsService {
    couponsRepo;
    userCouponRepo;
    productsRepo;
    collectionsRepo;
    constructor(couponsRepo, userCouponRepo, productsRepo, collectionsRepo) {
        this.couponsRepo = couponsRepo;
        this.userCouponRepo = userCouponRepo;
        this.productsRepo = productsRepo;
        this.collectionsRepo = collectionsRepo;
    }
    async create(dto) {
        const coupon = this.couponsRepo.create(dto);
        if (dto.collectionId) {
            const collection = await this.collectionsRepo.findOne({ where: { id: dto.collectionId } });
            if (!collection) {
                throw new common_1.NotFoundException('Collection not found');
            }
            coupon.collection = collection;
        }
        return this.couponsRepo.save(coupon);
    }
    async getSpecialCollectionDiscount(productIds) {
        const products = await this.productsRepo.find({
            where: { id: (0, typeorm_2.In)(productIds) },
            relations: ['collection', 'category_ID'],
        });
        const collections = new Map();
        for (const product of products) {
            if (!product.collection)
                continue;
            const colId = product.collection.id;
            if (!collections.has(colId)) {
                collections.set(colId, { base: [], expansions: [], config: product.collection });
            }
            if ((0, products_service_1.isBaseGame)(product))
                collections.get(colId).base.push(product);
            if ((0, products_service_1.isExpansion)(product))
                collections.get(colId).expansions.push(product);
        }
        for (const [colId, { base, expansions, config }] of collections.entries()) {
            if (base.length > 0 &&
                expansions.length > 0 &&
                config?.hasSpecialCoupon) {
                const basePercent = config.baseDiscountPercent ?? 10;
                const incrementPercent = config.incrementPerExpansion ?? 5;
                const discountPercent = basePercent + (expansions.length - 1) * incrementPercent;
                return { discountPercent, collectionId: colId };
            }
        }
        return { discountPercent: 0, collectionId: null };
    }
    async validateAndApply(code, orderValue, userId, productIds) {
        const { discountPercent, collectionId } = await this.getSpecialCollectionDiscount(productIds);
        if (discountPercent > 0) {
            const discount = (orderValue * discountPercent) / 100;
            return {
                coupon: {
                    id: 0,
                    code: 'COLLECTION_SPECIAL',
                    minOrderValue: 0,
                    maxOrderValue: orderValue,
                    startDate: new Date(),
                    endDate: new Date(),
                    usageLimit: 1,
                    usedCount: 0,
                    status: 'active',
                    discountPercent,
                    description: `Special collection coupon for collection ${collectionId}`,
                    userCoupons: [],
                    milestonePoints: null,
                    deletedAt: undefined,
                },
                discount,
            };
        }
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
    async getAllWithCollections() {
        return this.couponsRepo.find({ relations: ['collection'] });
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
        if (dto.collectionId !== undefined) {
            if (dto.collectionId) {
                const collection = await this.collectionsRepo.findOne({ where: { id: dto.collectionId } });
                if (!collection)
                    throw new common_1.NotFoundException('Collection not found');
                coupon.collection = collection;
            }
        }
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
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(collection_entity_1.Collection)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map