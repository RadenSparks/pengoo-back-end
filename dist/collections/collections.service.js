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
exports.CollectionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const collection_entity_1 = require("./collection.entity");
const product_entity_1 = require("../products/entities/product.entity");
const products_service_1 = require("../products/products.service");
const coupons_service_1 = require("../coupons/coupons.service");
let CollectionsService = class CollectionsService {
    collectionsRepo;
    productsRepo;
    couponsService;
    constructor(collectionsRepo, productsRepo, couponsService) {
        this.collectionsRepo = collectionsRepo;
        this.productsRepo = productsRepo;
        this.couponsService = couponsService;
    }
    findAll() {
        return this.collectionsRepo.createQueryBuilder('collection')
            .leftJoinAndSelect('collection.products', 'product')
            .leftJoinAndSelect('product.images', 'image')
            .leftJoinAndSelect('product.category_ID', 'category')
            .getMany();
    }
    findOne(slug) {
        return this.collectionsRepo.createQueryBuilder('collection')
            .where('collection.slug = :slug', { slug })
            .leftJoinAndSelect('collection.products', 'product')
            .leftJoinAndSelect('product.images', 'image')
            .leftJoinAndSelect('product.tags', 'tag')
            .leftJoinAndSelect('product.category_ID', 'category')
            .leftJoinAndSelect('collection.specialCoupon', 'specialCoupon')
            .getOne();
    }
    async create(dto) {
        const collection = this.collectionsRepo.create(dto);
        if (dto.productIds && dto.productIds.length) {
            collection.products = await this.productsRepo.findBy({ id: (0, typeorm_2.In)(dto.productIds) });
        }
        else {
            collection.products = [];
        }
        if (dto.specialCouponId) {
            collection.specialCoupon = { id: dto.specialCouponId };
            collection.specialCouponId = dto.specialCouponId;
            await this.couponsService.updateCouponCollectionId(dto.specialCouponId, collection.id);
        }
        return this.collectionsRepo.save(collection);
    }
    async update(id, dto) {
        const collection = await this.collectionsRepo.findOne({ where: { id }, relations: ['products'] });
        if (!collection)
            return null;
        Object.assign(collection, dto);
        if (dto.productIds) {
            collection.products = await this.productsRepo.findBy({ id: (0, typeorm_2.In)(dto.productIds) });
        }
        if (dto.specialCouponId !== undefined) {
            if (!dto.specialCouponId && collection.specialCouponId) {
                await this.couponsService.updateCouponCollectionId(collection.specialCouponId, null);
            }
            if (dto.specialCouponId) {
                await this.couponsService.updateCouponCollectionId(dto.specialCouponId, collection.id);
            }
            collection.specialCoupon = dto.specialCouponId ? { id: dto.specialCouponId } : null;
            collection.specialCouponId = dto.specialCouponId ?? null;
        }
        return this.collectionsRepo.save(collection);
    }
    async remove(id) {
        await this.couponsService.unassignCouponsFromCollection(id);
        await this.collectionsRepo.softDelete(id);
        return { deleted: true };
    }
    async restore(id) {
        await this.collectionsRepo.restore(id);
        return { restored: true };
    }
    async createBoardGameCollection(baseSlug) {
        const allProducts = await this.productsRepo.find({ relations: ['category_ID'] });
        const baseGame = allProducts.find(p => p.slug === baseSlug && (0, products_service_1.isBaseGame)(p));
        if (!baseGame)
            throw new Error('Base game not found');
        const expansions = (0, products_service_1.findExpansionsForBaseGame)(allProducts, baseSlug);
        const collection = this.collectionsRepo.create({
            name: `${baseGame.product_name} Collection`,
            slug: `${baseGame.slug}-collection`,
            products: [baseGame, ...expansions],
        });
        return this.collectionsRepo.save(collection);
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(collection_entity_1.Collection)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        coupons_service_1.CouponsService])
], CollectionsService);
//# sourceMappingURL=collections.service.js.map