"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsModule = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const products_controller_1 = require("./products.controller");
const category_entity_1 = require("../categories/category.entity");
const product_entity_1 = require("./product.entity");
const typeorm_1 = require("@nestjs/typeorm");
const categories_service_1 = require("../categories/categories.service");
const cloudinary_module_1 = require("../services/cloudinary/cloudinary.module");
const tags_service_1 = require("../tags/tags.service");
const publishers_service_1 = require("../publishers/publishers.service");
const tag_entity_1 = require("../tags/entities/tag.entity");
const publisher_entity_1 = require("../publishers/entities/publisher.entity");
const image_entity_1 = require("../images/entities/image.entity");
const images_service_1 = require("../images/images.service");
const collection_entity_1 = require("../collections/collection.entity");
const cms_content_module_1 = require("../cms-content/cms-content.module");
const cms_content_entity_1 = require("../cms-content/cms-content.entity");
let ProductsModule = class ProductsModule {
};
exports.ProductsModule = ProductsModule;
exports.ProductsModule = ProductsModule = __decorate([
    (0, common_1.Module)({
        providers: [products_service_1.ProductsService, images_service_1.ImagesService, categories_service_1.CategoriesService, tags_service_1.TagsService, publishers_service_1.PublishersService],
        controllers: [products_controller_1.ProductsController],
        imports: [typeorm_1.TypeOrmModule.forFeature([product_entity_1.Product, category_entity_1.Category, tag_entity_1.Tag, publisher_entity_1.Publisher, image_entity_1.Image, collection_entity_1.Collection, cms_content_entity_1.CmsContent]), cloudinary_module_1.CloudinaryModule, cms_content_module_1.CmsContentModule],
        exports: [products_service_1.ProductsService]
    })
], ProductsModule);
//# sourceMappingURL=products.module.js.map