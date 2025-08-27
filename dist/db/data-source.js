"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const category_entity_1 = require("../categories/category.entity");
const product_entity_1 = require("../products/entities/product.entity");
const user_entity_1 = require("../users/user.entity");
const order_entity_1 = require("../orders/order.entity");
const review_entity_1 = require("../reviews/review.entity");
const wishlist_entity_1 = require("../wishlist/wishlist.entity");
const publisher_entity_1 = require("../publishers/entities/publisher.entity");
const tag_entity_1 = require("../tags/entities/tag.entity");
const image_entity_1 = require("../images/entities/image.entity");
const delivery_entity_1 = require("../delivery/delivery.entity");
const coupon_entity_1 = require("../coupons/coupon.entity");
const ticket_earning_log_entity_1 = require("../minigame/ticket-earning-log.entity");
const user_coupon_entity_1 = require("../coupons/user-coupon.entity");
const posts_entity_1 = require("../posts/posts.entity");
const post_catalogue_entity_1 = require("../posts/post-catalogue.entity");
const admin_entity_1 = require("../admins/admin.entity");
const role_entity_1 = require("../roles/role.entity");
const role_permission_entity_1 = require("../roles/role-permission.entity");
const permission_entity_1 = require("../roles/permission.entity");
const collection_entity_1 = require("../collections/collection.entity");
const refund_entity_1 = require("../orders/refund.entity");
const refund_request_entity_1 = require("../orders/refund-request.entity");
const file_entity_1 = require("../orders/file.entity");
(0, dotenv_1.config)();
const dataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    entities: [
        user_entity_1.User, product_entity_1.Product, category_entity_1.Category, order_entity_1.Order, order_entity_1.OrderDetail, review_entity_1.Review, wishlist_entity_1.Wishlist, delivery_entity_1.Delivery, coupon_entity_1.Coupon, user_coupon_entity_1.UserCoupon, image_entity_1.Image,
        posts_entity_1.Post, post_catalogue_entity_1.PostCatalogue, collection_entity_1.Collection, publisher_entity_1.Publisher, tag_entity_1.Tag, ticket_earning_log_entity_1.TicketEarningLog,
        admin_entity_1.Admin, role_entity_1.Role, role_permission_entity_1.RolePermission, permission_entity_1.Permission, refund_entity_1.Refund, refund_request_entity_1.RefundRequest, file_entity_1.UploadFiles
    ],
    synchronize: true
};
console.log('Data Source Options:', dataSourceOptions);
exports.default = dataSourceOptions;
//# sourceMappingURL=data-source.js.map