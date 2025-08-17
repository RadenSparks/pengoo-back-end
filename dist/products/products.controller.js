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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./create-product.dto");
const update_product_dto_1 = require("./update-product.dto");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../auth/public.decorator");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async create(createProductDto, files) {
        const mainImage = files.find(f => f.fieldname === 'mainImage');
        const detailImages = files.filter(f => f.fieldname === 'detailImages');
        const featureImages = files.filter(f => f.fieldname === 'featureImages');
        const features = typeof createProductDto.featured === 'string'
            ? JSON.parse(createProductDto.featured)
            : createProductDto.featured;
        console.log(featureImages);
        if (!mainImage) {
            throw new Error('Main image is required');
        }
        return this.productsService.create(createProductDto, mainImage, detailImages, features, featureImages);
    }
    async findAll(name, categoryId, tags, minPrice, maxPrice, publisherId, status, sort, page, limit) {
        const filter = {
            name,
            categoryId,
            tags: tags ? tags.split(',') : undefined,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            publisherId: publisherId ? Number(publisherId) : undefined,
            status,
            sort,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 50,
        };
        const result = await this.productsService.paginatedSearchAndFilter(filter);
        result.data = result.data.map(p => ({
            ...p,
            publisherID: p.publisher_ID
                ? { id: p.publisher_ID.id, name: p.publisher_ID.name }
                : null,
        }));
        return result;
    }
    async findById(id) {
        const product = await this.productsService.findById(id);
        return {
            ...product,
            publisherID: product.publisher_ID
                ? { id: product.publisher_ID.id, name: product.publisher_ID.name }
                : null,
        };
    }
    async findBySlug(slug) {
        return this.productsService.findBySlug(slug);
    }
    async update(id, updateProductDto, files) {
        const mainImage = files?.find(f => f.fieldname === 'mainImage');
        const detailImages = files?.filter(f => f.fieldname === 'detailImages') || [];
        const featureImages = files?.filter(f => f.fieldname === 'featureImages') || [];
        const features = typeof updateProductDto.featured === 'string'
            ? JSON.parse(updateProductDto.featured)
            : updateProductDto.featured;
        const deleteImages = typeof updateProductDto.deleteImages === 'string'
            ? JSON.parse(updateProductDto.deleteImages)
            : updateProductDto.deleteImages;
        console.log(featureImages);
        const product = await this.productsService.update(id, updateProductDto, mainImage, detailImages, features, featureImages, deleteImages);
        return {
            ...product,
            publisherID: product.publisher_ID
                ? { id: product.publisher_ID.id, name: product.publisher_ID.name }
                : null,
        };
    }
    remove(id) {
        return this.productsService.remove(id);
    }
    async getCmsContent(id) {
        let product = await this.productsService.findOneWithCmsContent(Number(id));
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (!product.cmsContent) {
            product = await this.productsService.createCmsContentForProduct(Number(id));
        }
        const { product: _omit, ...cmsContentWithoutProduct } = product.cmsContent;
        return cmsContentWithoutProduct;
    }
    async updateCmsContent(id, body) {
        const updated = await this.productsService.updateCmsContent(Number(id), body);
        if (!updated)
            throw new common_1.NotFoundException('CMS content not found');
        return updated;
    }
    async restore(id) {
        await this.productsService.restore(id);
        return { message: 'Product restored successfully.' };
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        type: create_product_dto_1.CreateProductDto,
        examples: {
            default: {
                summary: 'Example product',
                value: {
                    product_name: "Sample Product",
                    description: "A great product for testing.",
                    features: [
                        { title: "Feature 1", content: "First feature description" },
                        { title: "Feature 2", content: "Second feature description" }
                    ],
                    product_price: 99.99,
                    discount: 10,
                    slug: "sample-product",
                    meta_title: "Sample Product Meta Title",
                    meta_description: "Meta description for SEO.",
                    quantity_sold: 0,
                    quantity_stock: 100,
                    categoryId: 1,
                    publisherID: 1,
                    status: "active",
                    tags: ["electronics", "gadget"]
                }
            }
        }
    }),
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Array]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('name')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('tags')),
    __param(3, (0, common_1.Query)('minPrice')),
    __param(4, (0, common_1.Query)('maxPrice')),
    __param(5, (0, common_1.Query)('publisher')),
    __param(6, (0, common_1.Query)('status')),
    __param(7, (0, common_1.Query)('sort')),
    __param(8, (0, common_1.Query)('page')),
    __param(9, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, Number, Number, Number, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('slug/:slug'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductDto, Array]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/cms-content'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getCmsContent", null);
__decorate([
    (0, common_1.Put)(':id/cms-content'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateCmsContent", null);
__decorate([
    (0, common_1.Put)(':id/restore'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "restore", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map