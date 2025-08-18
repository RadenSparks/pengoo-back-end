import { config } from 'dotenv';
import { Category } from '../categories/category.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { DataSourceOptions } from 'typeorm';
import { Order, OrderDetail } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Wishlist } from '../wishlist/wishlist.entity';
import { Publisher } from '../publishers/entities/publisher.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Image } from '../products/entities/image.entity';
import { Delivery } from '../delivery/delivery.entity';
import { Coupon } from '../coupons/coupon.entity';
import { TicketEarningLog } from '../minigame/ticket-earning-log.entity';
import { UserCoupon } from '../coupons/user-coupon.entity';
import { Post } from '../posts/posts.entity';
import { PostCatalogue } from '../posts/post-catalogue.entity';
import { Admin } from '../admins/admin.entity';
import { Role } from '../roles/role.entity';
import { RolePermission } from '../roles/role-permission.entity';
import { Permission } from '../roles/permission.entity';
import { Collection } from '../collections/collection.entity';
import { Refund } from 'src/orders/refund.entity';
import { RefundRequest } from 'src/orders/refund-request.entity';
import { UploadFiles } from 'src/orders/file.entity';


config();

const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    entities: [
        User, Product, Category, Order, OrderDetail, Review, Wishlist, Delivery, Coupon, UserCoupon, Image,
        Post, PostCatalogue, Collection, Publisher, Tag, TicketEarningLog,
        Admin, Role, RolePermission, Permission, Refund, RefundRequest, UploadFiles
    ],
    synchronize: true
};

console.log('Data Source Options:', dataSourceOptions);

export default dataSourceOptions;