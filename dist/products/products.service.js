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
exports.ProductsService = exports.FilterProductDto = void 0;
exports.isBaseGame = isBaseGame;
exports.isExpansion = isExpansion;
exports.getBaseSlug = getBaseSlug;
exports.findExpansionsForBaseGame = findExpansionsForBaseGame;
exports.checkStockBeforeOrder = checkStockBeforeOrder;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const categories_service_1 = require("../categories/categories.service");
const cloudinary_service_1 = require("../services/cloudinary/cloudinary.service");
const tag_entity_1 = require("../tags/entities/tag.entity");
const publishers_service_1 = require("../publishers/publishers.service");
const tags_service_1 = require("../tags/tags.service");
const image_entity_1 = require("../images/entities/image.entity");
const slugify_1 = require("slugify");
const cms_content_service_1 = require("../cms-content/cms-content.service");
const cms_content_entity_1 = require("../cms-content/cms-content.entity");
class FilterProductDto {
    name;
    category_ID;
    tags;
    minPrice;
    maxPrice;
    publisherId;
    status;
    sort;
    page;
    limit;
}
exports.FilterProductDto = FilterProductDto;
let ProductsService = class ProductsService {
    productsRepository;
    publishersService;
    categoriesService;
    cloudinaryService;
    tagsService;
    tagRepo;
    imageRepository;
    cmsContentService;
    cmsContentRepository;
    constructor(productsRepository, publishersService, categoriesService, cloudinaryService, tagsService, tagRepo, imageRepository, cmsContentService, cmsContentRepository) {
        this.productsRepository = productsRepository;
        this.publishersService = publishersService;
        this.categoriesService = categoriesService;
        this.cloudinaryService = cloudinaryService;
        this.tagsService = tagsService;
        this.tagRepo = tagRepo;
        this.imageRepository = imageRepository;
        this.cmsContentService = cmsContentService;
        this.cmsContentRepository = cmsContentRepository;
    }
    async create(createProductDto, mainImage, detailImages, features, featureImages) {
        const category_ID = await this.categoriesService.findById(createProductDto.category_ID);
        const publisher_ID = await this.publishersService.findOne(createProductDto.publisherID);
        const newProduct = new product_entity_1.Product();
        const images = [];
        if (mainImage) {
            const uploadMain = await this.cloudinaryService.uploadImage(mainImage, 'product', { userId: 0 });
            const mainImg = new image_entity_1.Image();
            mainImg.url = uploadMain.secure_url;
            mainImg.name = 'main';
            images.push(mainImg);
        }
        if (detailImages && detailImages.length > 0) {
            const detailImageEntities = await Promise.all(detailImages.map(async (file) => {
                const result = await this.cloudinaryService.uploadImage(file, 'product', { userId: 0 });
                const img = new image_entity_1.Image();
                img.url = result.secure_url;
                img.name = 'detail';
                return img;
            }));
            images.push(...detailImageEntities);
        }
        features = Array.isArray(features) ? features : [];
        let featuredImageEntities = [];
        if (features.length > 0) {
            featuredImageEntities = await Promise.all(features.map(async (f, i) => {
                const imageFile = featureImages[i];
                if (!imageFile?.buffer) {
                    throw new common_1.BadRequestException(`Missing feature image for feature ${i}`);
                }
                const uploaded = await this.cloudinaryService.uploadImage(imageFile, 'product', { userId: 0 });
                const img = new image_entity_1.Image();
                img.url = uploaded.secure_url;
                img.name = 'featured';
                img.ord = f.ord;
                return img;
            }));
            images.push(...featuredImageEntities);
        }
        let tags = [];
        if (createProductDto.tags && typeof createProductDto.tags === 'string') {
            const tag_ID = createProductDto.tags
                .split(' ')
                .map(tag => tag.trim())
                .filter(tag => tag !== '');
            if (tag_ID.length > 0) {
                tags = await Promise.all(tag_ID.map(async (id) => {
                    let tag = await this.tagsService.findOne(+(id));
                    return tag;
                }));
            }
        }
        newProduct.product_name = createProductDto.product_name;
        newProduct.description = createProductDto.description;
        newProduct.product_price = createProductDto.product_price;
        newProduct.slug = createProductDto.slug || (0, slugify_1.default)(createProductDto.product_name, { lower: true });
        newProduct.quantity_sold = createProductDto.quantity_sold;
        newProduct.quantity_stock = createProductDto.quantity_stock;
        newProduct.category_ID = category_ID;
        newProduct.publisher_ID = publisher_ID;
        newProduct.discount = createProductDto.discount;
        newProduct.meta_description = createProductDto.meta_description;
        newProduct.meta_title = createProductDto.meta_title;
        newProduct.status = createProductDto.status;
        newProduct.tags = tags;
        newProduct.images = images;
        const savedProduct = await this.productsRepository.save(newProduct);
        if (createProductDto.cms_content) {
            await this.cmsContentService.create(savedProduct.id, createProductDto.cms_content);
        }
        return savedProduct;
    }
    async searchAndFilter(filter) {
        const query = this.productsRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.category_ID', 'category')
            .leftJoinAndSelect('product.publisher_ID', 'publisher')
            .leftJoinAndSelect('product.tags', 'tags')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('product.collection', 'collection');
        if (filter.name) {
            query.andWhere('product.product_name ILIKE :name', { name: `%${filter.name}%` });
        }
        if (filter.category_ID) {
            query.andWhere('category.id = :category_ID', { category_ID: filter.category_ID });
        }
        if (filter.tags && filter.tags.length > 0) {
            query.andWhere('tags.name IN (:...tags)', { tags: filter.tags });
        }
        if (filter.minPrice) {
            query.andWhere('product.product_price >= :minPrice', { minPrice: filter.minPrice });
        }
        if (filter.maxPrice) {
            query.andWhere('product.product_price <= :maxPrice', { maxPrice: filter.maxPrice });
        }
        if (filter.publisherId) {
            query.andWhere('publisher.id = :publisherId', { publisherId: filter.publisherId });
        }
        if (filter.status) {
            query.andWhere('product.status = :status', { status: filter.status });
        }
        switch (filter.sort) {
            case 'price_asc':
                query.orderBy('product.product_price', 'ASC');
                break;
            case 'price_desc':
                query.orderBy('product.product_price', 'DESC');
                break;
            case 'sold_desc':
                query.orderBy('product.quantity_sold', 'DESC');
                break;
            default:
                query.orderBy('product.created_at', 'DESC');
        }
        const page = filter.page || 1;
        const limit = filter.limit || 50;
        query.skip((page - 1) * limit).take(limit);
        const products = await query.getMany();
        return products;
    }
    async paginatedSearchAndFilter(filter) {
        const query = this.productsRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.category_ID', 'category')
            .leftJoinAndSelect('product.publisher_ID', 'publisher')
            .leftJoinAndSelect('product.tags', 'tags')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('product.collection', 'collection');
        if (filter.name) {
            query.andWhere('product.product_name ILIKE :name', { name: `%${filter.name}%` });
        }
        if (filter.category_ID) {
            query.andWhere('category.id = :category_ID', { category_ID: filter.category_ID });
        }
        if (filter.tags && filter.tags.length > 0) {
            query.andWhere('tags.name IN (:...tags)', { tags: filter.tags });
        }
        if (filter.minPrice) {
            query.andWhere('product.product_price >= :minPrice', { minPrice: filter.minPrice });
        }
        if (filter.maxPrice) {
            query.andWhere('product.product_price <= :maxPrice', { maxPrice: filter.maxPrice });
        }
        if (filter.publisherId) {
            query.andWhere('publisher.id = :publisherId', { publisherId: filter.publisherId });
        }
        if (filter.status) {
            query.andWhere('product.status = :status', { status: filter.status });
        }
        switch (filter.sort) {
            case 'price_asc':
                query.orderBy('product.product_price', 'ASC');
                break;
            case 'price_desc':
                query.orderBy('product.product_price', 'DESC');
                break;
            case 'sold_desc':
                query.orderBy('product.quantity_sold', 'DESC');
                break;
            default:
                query.orderBy('product.created_at', 'DESC');
        }
        const page = filter.page || 1;
        const limit = filter.limit || 50;
        query.skip((page - 1) * limit).take(limit);
        const [data, total] = await query.getManyAndCount();
        return { data, total, page, limit };
    }
    async findById(id) {
        const product = await this.productsRepository.findOne({
            where: { id: id },
            relations: [
                'category_ID',
                'publisher_ID',
                'tags',
                'images',
                'cmsContent',
            ],
            withDeleted: true,
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.category_ID?.id) {
            product.category_ID = await this.categoriesService.findById(product.category_ID.id);
        }
        if (product.tags?.length) {
            product.tags = await Promise.all(product.tags.map(async (tag) => {
                return await this.tagsService.findOne(tag.id);
            }));
        }
        return product;
    }
    async findBySlug(slug) {
        const product = await this.productsRepository.findOne({
            where: { slug },
            relations: [
                'category_ID',
                'publisher_ID',
                'tags',
                'images',
                'cmsContent',
            ],
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async findOneWithCmsContent(id) {
        return this.productsRepository.findOne({
            where: { id },
            relations: ['cmsContent'],
        });
    }
    async update(id, updateProductDto, mainImage, detailImages, features, featureImages, deleteImages) {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ['tags', 'category_ID', 'publisher_ID', 'images'],
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        if (updateProductDto.category_ID) {
            product.category_ID = await this.categoriesService.findById(updateProductDto.category_ID);
        }
        if (updateProductDto.publisherID) {
            product.publisher_ID = await this.publishersService.findOne(updateProductDto.publisherID);
        }
        if (deleteImages?.length) {
            const toRemove = await this.imageRepository.findBy({
                id: (0, typeorm_2.In)(deleteImages),
                product: { id },
            });
            if (toRemove.length > 0) {
                await this.imageRepository.remove(toRemove);
                product.images = product.images.filter(img => !deleteImages.includes(img.id));
            }
        }
        if (mainImage) {
            const uploadMain = await this.cloudinaryService.uploadImage(mainImage, 'product', { userId: 0 });
            const prevMainImg = product.images.find(img => img.name === "main");
            if (prevMainImg) {
                await this.imageRepository.remove(prevMainImg);
                product.images = product.images.filter(img => img.id !== prevMainImg.id);
            }
            const mainImg = this.imageRepository.create({
                product,
                name: "main",
                url: uploadMain.secure_url,
                ord: 0,
            });
            const savedMainImg = await this.imageRepository.save(mainImg);
            product.images.push(savedMainImg);
        }
        if (detailImages && detailImages.length > 0) {
            const detailImageEntities = await Promise.all(detailImages.map(async (file) => {
                const detailUploads = await this.cloudinaryService.uploadImage(file, 'product', { userId: 0 });
                const img = this.imageRepository.create({
                    product: product,
                    name: "detail",
                    url: detailUploads.secure_url,
                    ord: 0,
                });
                return await this.imageRepository.save(img);
            }));
            product.images.push(...detailImageEntities);
        }
        if (featureImages?.length && features?.length) {
            const featuredImages = product.images.filter(i => i.name === 'featured');
            let ordLastImage = featuredImages.length > 0
                ? Math.max(...featuredImages.map(i => i.ord ?? 0))
                : -1;
            const featuredImageEntities = await Promise.all(featureImages.map(async (f) => {
                ordLastImage += 1;
                const uploaded = await this.cloudinaryService.uploadImage(f, 'product', { userId: 0 });
                const newImg = this.imageRepository.create({
                    url: uploaded.secure_url,
                    name: 'featured',
                    ord: ordLastImage,
                    product,
                });
                return await this.imageRepository.save(newImg);
            }));
            product.images.push(...featuredImageEntities);
        }
        if (updateProductDto.tags && typeof updateProductDto.tags === 'string') {
            const tagIds = updateProductDto.tags
                .split(' ')
                .map(tag => tag.trim())
                .filter(tag => tag !== '')
                .map(id => Number(id));
            if (tagIds.length > 0) {
                const tags = await this.tagRepo.findBy({ id: (0, typeorm_2.In)(tagIds) });
                product.tags = tags;
            }
            else {
                product.tags = [];
            }
        }
        product.product_name = updateProductDto.product_name ?? product.product_name;
        product.description = updateProductDto.description ?? product.description;
        product.product_price = updateProductDto.product_price ?? product.product_price;
        product.slug = updateProductDto.slug ?? product.slug;
        product.quantity_sold = updateProductDto.quantity_sold ?? product.quantity_sold;
        product.quantity_stock = updateProductDto.quantity_stock ?? product.quantity_stock;
        product.discount = updateProductDto.discount ?? product.discount;
        product.meta_description = updateProductDto.meta_description ?? product.meta_description;
        product.meta_title = updateProductDto.meta_title ?? product.meta_title;
        product.status = updateProductDto.status ?? product.status;
        if (updateProductDto.cms_content) {
            await this.cmsContentService.update(product.id, updateProductDto.cms_content);
        }
        const updatedProduct = await this.productsRepository.save(product);
        return updatedProduct;
    }
    async remove(id) {
        const product = await this.findById(id);
        await this.productsRepository.softRemove(product);
    }
    async updateCmsContent(id, data) {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ['cmsContent'],
        });
        if (!product || !product.cmsContent)
            return null;
        Object.assign(product.cmsContent, data);
        await this.cmsContentRepository.save(product.cmsContent);
        return product.cmsContent;
    }
    async createCmsContentForProduct(id) {
        const product = await this.productsRepository.findOne({ where: { id }, relations: ['cmsContent'] });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (!product.cmsContent) {
            const cmsContent = this.cmsContentRepository.create();
            cmsContent.product = product;
            await this.cmsContentRepository.save(cmsContent);
            product.cmsContent = cmsContent;
            await this.productsRepository.save(product);
        }
        return product;
    }
    async restore(id) {
        await this.productsRepository.restore(id);
    }
    async save(product) {
        return this.productsRepository.save(product);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(5, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __param(6, (0, typeorm_1.InjectRepository)(image_entity_1.Image)),
    __param(8, (0, typeorm_1.InjectRepository)(cms_content_entity_1.CmsContent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        publishers_service_1.PublishersService,
        categories_service_1.CategoriesService,
        cloudinary_service_1.CloudinaryService,
        tags_service_1.TagsService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        cms_content_service_1.CmsContentService,
        typeorm_2.Repository])
], ProductsService);
function isBaseGame(product) {
    return product.category_ID?.name === "Board Game";
}
function isExpansion(product) {
    return product.category_ID?.name === "Expansions";
}
function getBaseSlug(slug) {
    const match = slug.match(/^(.+)-.+$/);
    return match ? match[1] : slug;
}
function findExpansionsForBaseGame(products, baseSlug) {
    return products.filter(p => isExpansion(p) && p.slug.startsWith(baseSlug + "-"));
}
function checkStockBeforeOrder(product, detail) {
    if (product.quantity_stock < detail.quantity) {
        throw new common_1.BadRequestException(`Not enough stock for product ${product.product_name}`);
    }
}
//# sourceMappingURL=products.service.js.map