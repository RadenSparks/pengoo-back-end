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
exports.CmsContentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cms_content_entity_1 = require("./cms-content.entity");
const product_entity_1 = require("../products/entities/product.entity");
let CmsContentService = class CmsContentService {
    cmsContentRepo;
    productRepo;
    constructor(cmsContentRepo, productRepo) {
        this.cmsContentRepo = cmsContentRepo;
        this.productRepo = productRepo;
    }
    async create(productId, dto) {
        const product = await this.productRepo.findOneBy({ id: productId });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const cms = this.cmsContentRepo.create({ ...dto, product });
        return this.cmsContentRepo.save(cms);
    }
    async update(productId, dto) {
        const cms = await this.cmsContentRepo.findOne({ where: { product: { id: productId } } });
        if (!cms)
            throw new common_1.NotFoundException('CMS Content not found');
        Object.assign(cms, dto);
        return this.cmsContentRepo.save(cms);
    }
    async findByProduct(productId) {
        return this.cmsContentRepo.findOne({ where: { product: { id: productId } } });
    }
    async remove(id) {
        await this.cmsContentRepo.softDelete(id);
        return { deleted: true };
    }
    async restore(id) {
        await this.cmsContentRepo.restore(id);
        return { restored: true };
    }
};
exports.CmsContentService = CmsContentService;
exports.CmsContentService = CmsContentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cms_content_entity_1.CmsContent)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CmsContentService);
//# sourceMappingURL=cms-content.service.js.map