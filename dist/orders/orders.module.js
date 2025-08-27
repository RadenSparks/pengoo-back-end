"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const orders_controller_1 = require("./orders.controller");
const order_entity_1 = require("./order.entity");
const typeorm_1 = require("@nestjs/typeorm");
const users_service_1 = require("../users/users.service");
const user_entity_1 = require("../users/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const category_entity_1 = require("../categories/category.entity");
const categories_service_1 = require("../categories/categories.service");
const publishers_module_1 = require("../publishers/publishers.module");
const cloudinary_module_1 = require("../services/cloudinary/cloudinary.module");
const tags_module_1 = require("../tags/tags.module");
const tag_entity_1 = require("../tags/entities/tag.entity");
const notifications_module_1 = require("../notifications/notifications.module");
const delivery_entity_1 = require("../delivery/delivery.entity");
const coupons_module_1 = require("../coupons/coupons.module");
const image_entity_1 = require("../images/entities/image.entity");
const payos_service_1 = require("../services/payos/payos.service");
const cms_content_module_1 = require("../cms-content/cms-content.module");
const products_module_1 = require("../products/products.module");
const invoices_module_1 = require("../services/invoices/invoices.module");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        providers: [
            orders_service_1.OrdersService,
            users_service_1.UsersService,
            categories_service_1.CategoriesService,
            payos_service_1.PayosService
        ],
        controllers: [orders_controller_1.OrdersController],
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                order_entity_1.Order,
                order_entity_1.OrderDetail,
                user_entity_1.User,
                product_entity_1.Product,
                category_entity_1.Category,
                tag_entity_1.Tag,
                delivery_entity_1.Delivery,
                image_entity_1.Image,
            ]),
            publishers_module_1.PublishersModule,
            cloudinary_module_1.CloudinaryModule,
            tags_module_1.TagsModule,
            notifications_module_1.NotificationsModule,
            coupons_module_1.CouponsModule,
            cms_content_module_1.CmsContentModule,
            products_module_1.ProductsModule,
            invoices_module_1.InvoicesModule,
        ],
        exports: [orders_service_1.OrdersService]
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map