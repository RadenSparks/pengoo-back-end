import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './wishlist.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/category.entity';
import { CloudinaryModule } from '../services/cloudinary/cloudinary.module';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wishlist, User, Product, Category]),
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CloudinaryModule,
  ],
  providers: [WishlistService],
  controllers: [WishlistController],
  exports: [WishlistService],
})
export class WishlistModule {}
