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
const product_entity_1 = require("../products/product.entity");
let CollectionsService = class CollectionsService {
    collectionsRepo;
    productsRepo;
    constructor(collectionsRepo, productsRepo) {
        this.collectionsRepo = collectionsRepo;
        this.productsRepo = productsRepo;
    }
    findAll() {
        return this.collectionsRepo.createQueryBuilder('collection')
            .leftJoinAndSelect('collection.products', 'product')
            .leftJoinAndSelect('product.images', 'image')
            .getMany();
    }
    findOne(slug) {
        return this.collectionsRepo.createQueryBuilder('collection')
            .where('collection.slug = :slug', { slug })
            .leftJoinAndSelect('collection.products', 'product')
            .leftJoinAndSelect('product.images', 'image')
            .leftJoinAndSelect('product.tags', 'tag')
            .leftJoinAndSelect('product.category_ID', 'category')
            .getOne();
    }
    async create(dto) {
        if (!dto)
            throw new Error('No data received');
        const collection = this.collectionsRepo.create(dto);
        if (dto.productIds && dto.productIds.length) {
            collection.products = await this.productsRepo.findBy({ id: (0, typeorm_2.In)(dto.productIds) });
        }
        else {
            collection.products = [];
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
        return this.collectionsRepo.save(collection);
    }
    async remove(id) {
        await this.collectionsRepo.delete(id);
        return { deleted: true };
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(collection_entity_1.Collection)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CollectionsService);
//# sourceMappingURL=collections.service.js.map