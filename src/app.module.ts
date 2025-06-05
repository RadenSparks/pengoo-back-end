import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { Category } from './categories/category.entity';
import { OrdersModule } from './orders/orders.module';
import { Order, OrderItem } from './orders/order.entity';
import { CartModule } from './cart/cart.module';
import { ReviewsModule } from './reviews/reviews.module';
import { Review } from './reviews/review.entity';
import { WishlistModule } from './wishlist/wishlist.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CategoriesService } from './categories/categories.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesModule } from './categories/categories.module';
import dataSourceOptions from './db/data-source';
import { Cart } from './cart/cart.entity';
import { Wishlist } from './wishlist/wishlist.entity';
import { CloudinaryModule } from './services/cloudinary/cloudinary.module';
import { TagsModule } from './tags/tags.module';
import { PublishersModule } from './publishers/publishers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => (dataSourceOptions),
    }),
    TypeOrmModule.forFeature([User, Product, Category, Order, OrderItem, Review, Cart, Wishlist]),
    UsersModule,
    AuthModule,
    ProductsModule,
    // OrdersModule,
    // CartModule,
    // ReviewsModule,
    // WishlistModule,
    CategoriesModule,
    TagsModule,
    PublishersModule,

  ],
  providers: [CategoriesService],
  controllers: [CategoriesController],
})
export class AppModule { }