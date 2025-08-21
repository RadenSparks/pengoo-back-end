"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const products_module_1 = require("./products/products.module");
const user_entity_1 = require("./users/user.entity");
const product_entity_1 = require("./products/product.entity");
const category_entity_1 = require("./categories/category.entity");
const orders_module_1 = require("./orders/orders.module");
const order_entity_1 = require("./orders/order.entity");
const reviews_module_1 = require("./reviews/reviews.module");
const review_entity_1 = require("./reviews/review.entity");
const wishlist_module_1 = require("./wishlist/wishlist.module");
const config_1 = require("@nestjs/config");
const categories_service_1 = require("./categories/categories.service");
const categories_controller_1 = require("./categories/categories.controller");
const categories_module_1 = require("./categories/categories.module");
const data_source_1 = require("./db/data-source");
const wishlist_entity_1 = require("./wishlist/wishlist.entity");
const cloudinary_module_1 = require("./services/cloudinary/cloudinary.module");
const tags_module_1 = require("./tags/tags.module");
const publishers_module_1 = require("./publishers/publishers.module");
const payment_module_1 = require("./services/payment/payment.module");
const invoices_module_1 = require("./services/invoices/invoices.module");
const notifications_module_1 = require("./notifications/notifications.module");
const posts_module_1 = require("./posts/posts.module");
const delivery_module_1 = require("./delivery/delivery.module");
const delivery_entity_1 = require("./delivery/delivery.entity");
const minigame_module_1 = require("./minigame/minigame.module");
const coupon_entity_1 = require("./coupons/coupon.entity");
const core_1 = require("@nestjs/core");
const roles_guard_1 = require("./auth/roles.guard");
const images_module_1 = require("./images/images.module");
const image_entity_1 = require("./images/entities/image.entity");
const roles_module_1 = require("./roles/roles.module");
const posts_entity_1 = require("./posts/posts.entity");
const post_catalogue_entity_1 = require("./posts/post-catalogue.entity");
const collections_module_1 = require("./collections/collections.module");
const collection_entity_1 = require("./collections/collection.entity");
const cms_content_module_1 = require("./cms-content/cms-content.module");
const cms_content_entity_1 = require("./cms-content/cms-content.entity");
const publisher_entity_1 = require("./publishers/entities/publisher.entity");
const tag_entity_1 = require("./tags/entities/tag.entity");
const user_coupon_entity_1 = require("./coupons/user-coupon.entity");
const ticket_earning_log_entity_1 = require("./minigame/ticket-earning-log.entity");
const admin_entity_1 = require("./admins/admin.entity");
const role_entity_1 = require("./roles/role.entity");
const role_permission_entity_1 = require("./roles/role-permission.entity");
const permission_entity_1 = require("./roles/permission.entity");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const file_entity_1 = require("./orders/file.entity");
const refund_request_entity_1 = require("./orders/refund-request.entity");
const refund_entity_1 = require("./orders/refund.entity");
const paypal_module_1 = require("./services/paypal/paypal.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    ...data_source_1.default,
                    entities: [
                        user_entity_1.User, product_entity_1.Product, category_entity_1.Category, order_entity_1.Order, order_entity_1.OrderDetail, review_entity_1.Review, wishlist_entity_1.Wishlist, delivery_entity_1.Delivery, coupon_entity_1.Coupon, user_coupon_entity_1.UserCoupon, image_entity_1.Image,
                        posts_entity_1.Post, post_catalogue_entity_1.PostCatalogue, collection_entity_1.Collection, cms_content_entity_1.CmsContent, publisher_entity_1.Publisher, tag_entity_1.Tag, ticket_earning_log_entity_1.TicketEarningLog,
                        admin_entity_1.Admin, role_entity_1.Role, role_permission_entity_1.RolePermission, permission_entity_1.Permission, refund_entity_1.Refund, refund_request_entity_1.RefundRequest, file_entity_1.UploadFiles
                    ],
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User, product_entity_1.Product, category_entity_1.Category, order_entity_1.Order, order_entity_1.OrderDetail, review_entity_1.Review, wishlist_entity_1.Wishlist, delivery_entity_1.Delivery, coupon_entity_1.Coupon, user_coupon_entity_1.UserCoupon, image_entity_1.Image,
                posts_entity_1.Post, post_catalogue_entity_1.PostCatalogue, collection_entity_1.Collection, cms_content_entity_1.CmsContent, publisher_entity_1.Publisher, tag_entity_1.Tag, ticket_earning_log_entity_1.TicketEarningLog,
                admin_entity_1.Admin, role_entity_1.Role, role_permission_entity_1.RolePermission, permission_entity_1.Permission, refund_entity_1.Refund, refund_request_entity_1.RefundRequest, file_entity_1.UploadFiles
            ]),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
            reviews_module_1.ReviewsModule,
            wishlist_module_1.WishlistModule,
            categories_module_1.CategoriesModule,
            tags_module_1.TagsModule,
            publishers_module_1.PublishersModule,
            payment_module_1.PaymentModule,
            invoices_module_1.InvoicesModule,
            cloudinary_module_1.CloudinaryModule,
            notifications_module_1.NotificationsModule,
            posts_module_1.PostsModule,
            delivery_module_1.DeliveryModule,
            minigame_module_1.MinigameModule,
            images_module_1.ImagesModule,
            roles_module_1.RolesModule,
            collections_module_1.CollectionsModule,
            cms_content_module_1.CmsContentModule,
            paypal_module_1.PaypalModule,
        ],
        providers: [
            categories_service_1.CategoriesService,
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            app_service_1.AppService,
        ],
        controllers: [categories_controller_1.CategoriesController, app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map