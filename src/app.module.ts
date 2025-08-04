import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { Category } from './categories/category.entity';
import { OrdersModule } from './orders/orders.module';
import { Order, OrderDetail } from './orders/order.entity';
import { ReviewsModule } from './reviews/reviews.module';
import { Review } from './reviews/review.entity';
import { WishlistModule } from './wishlist/wishlist.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoriesService } from './categories/categories.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesModule } from './categories/categories.module';
import dataSourceOptions from './db/data-source';
import { Wishlist } from './wishlist/wishlist.entity';
import { CloudinaryModule } from './services/cloudinary/cloudinary.module';
import { TagsModule } from './tags/tags.module';
import { PublishersModule } from './publishers/publishers.module';
import { PaymentModule } from './services/payment/payment.module';
import { InvoicesModule } from './services/invoices/invoices.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PostsModule } from './posts/posts.module';
import { DeliveryModule } from './delivery/delivery.module';
import { Delivery } from './delivery/delivery.entity';
import { MinigameModule } from './minigame/minigame.module';
import { Coupon } from './coupons/coupon.entity';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { ImagesModule } from './images/images.module';
import { Image } from './products/entities/image.entity';
import { RolesModule } from './roles/roles.module';
import { Post } from './posts/posts.entity';
import { PostCatalogue } from './posts/post-catalogue.entity';
import { CollectionsModule } from './collections/collections.module';
import { Collection } from './collections/collection.entity';
import { CmsContentModule } from './cms-content/cms-content.module';
import { CmsContent } from './cms-content/cms-content.entity';
import { Publisher } from './publishers/entities/publisher.entity';
import { Tag } from './tags/entities/tag.entity';
import { UserCoupon } from './coupons/user-coupon.entity'; // Adjust the path if needed
import { TicketEarningLog } from './minigame/ticket-earning-log.entity';
import { Admin } from './admins/admin.entity'; // Adjust the path if needed
import { Role } from './roles/role.entity'; // Adjust the path if needed
import { RolePermission } from './roles/role-permission.entity'; // Adjust the path if needed
import { Permission } from './roles/permission.entity'; // Adjust the path if needed
import { AppController } from './app.controller';
import { AppService } from './app.service';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...dataSourceOptions,
        entities: [
          User, Product, Category, Order, OrderDetail, Review, Wishlist, Delivery, Coupon, UserCoupon, Image,
          Post, PostCatalogue, Collection, CmsContent, Publisher, Tag, TicketEarningLog,
          Admin, Role, RolePermission, Permission // <-- Add Permission here
        ],
      }),
    }),
    TypeOrmModule.forFeature([
      User, Product, Category, Order, OrderDetail, Review, Wishlist, Delivery, Coupon, UserCoupon, Image,
      Post, PostCatalogue, Collection, CmsContent, Publisher, Tag, TicketEarningLog,
      Admin, Role, RolePermission, Permission // <-- Add Permission here
    ]),
    UsersModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    ReviewsModule,
    WishlistModule,
    CategoriesModule,
    TagsModule,
    PublishersModule,
    PaymentModule,
    InvoicesModule,
    CloudinaryModule,
    NotificationsModule,
    PostsModule,
    DeliveryModule,
    MinigameModule,
    ImagesModule,
    RolesModule,
    CollectionsModule,
    CmsContentModule,

  ],
  providers: [
    CategoriesService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AppService, // <-- Add AppService here
  ],
  controllers: [CategoriesController, AppController], // <-- Add AppController here
})
export class AppModule { }