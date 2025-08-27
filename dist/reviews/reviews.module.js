"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reviews_service_1 = require("./reviews.service");
const reviews_controller_1 = require("./reviews.controller");
const review_entity_1 = require("./review.entity");
const user_entity_1 = require("../users/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const category_entity_1 = require("../categories/category.entity");
const tag_entity_1 = require("../tags/entities/tag.entity");
const publishers_module_1 = require("../publishers/publishers.module");
const cloudinary_module_1 = require("../services/cloudinary/cloudinary.module");
const tags_module_1 = require("../tags/tags.module");
const users_module_1 = require("../users/users.module");
const orders_module_1 = require("../orders/orders.module");
const order_entity_1 = require("../orders/order.entity");
const products_module_1 = require("../products/products.module");
let ReviewsModule = class ReviewsModule {
};
exports.ReviewsModule = ReviewsModule;
exports.ReviewsModule = ReviewsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                review_entity_1.Review,
                user_entity_1.User,
                product_entity_1.Product,
                order_entity_1.Order,
                category_entity_1.Category,
                tag_entity_1.Tag,
            ]),
            publishers_module_1.PublishersModule,
            cloudinary_module_1.CloudinaryModule,
            tags_module_1.TagsModule,
            users_module_1.UsersModule,
            orders_module_1.OrdersModule,
            products_module_1.ProductsModule,
        ],
        providers: [reviews_service_1.ReviewsService],
        controllers: [reviews_controller_1.ReviewsController],
        exports: [reviews_service_1.ReviewsService],
    })
], ReviewsModule);
//# sourceMappingURL=reviews.module.js.map