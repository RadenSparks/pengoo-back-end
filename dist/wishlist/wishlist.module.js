"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistModule = void 0;
const common_1 = require("@nestjs/common");
const wishlist_service_1 = require("./wishlist.service");
const wishlist_controller_1 = require("./wishlist.controller");
const typeorm_1 = require("@nestjs/typeorm");
const wishlist_entity_1 = require("./wishlist.entity");
const user_entity_1 = require("../users/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const category_entity_1 = require("../categories/category.entity");
const cloudinary_module_1 = require("../services/cloudinary/cloudinary.module");
const users_module_1 = require("../users/users.module");
const products_module_1 = require("../products/products.module");
const categories_module_1 = require("../categories/categories.module");
const orders_module_1 = require("../orders/orders.module");
let WishlistModule = class WishlistModule {
};
exports.WishlistModule = WishlistModule;
exports.WishlistModule = WishlistModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([wishlist_entity_1.Wishlist, user_entity_1.User, product_entity_1.Product, category_entity_1.Category]),
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            categories_module_1.CategoriesModule,
            orders_module_1.OrdersModule,
            cloudinary_module_1.CloudinaryModule,
        ],
        providers: [wishlist_service_1.WishlistService],
        controllers: [wishlist_controller_1.WishlistController],
        exports: [wishlist_service_1.WishlistService],
    })
], WishlistModule);
//# sourceMappingURL=wishlist.module.js.map