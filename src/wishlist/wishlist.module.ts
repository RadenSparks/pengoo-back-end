import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './wishlist.entity';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { CategoriesService } from 'src/categories/categories.service';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';
import { Category } from 'src/categories/category.entity';

@Module({
  providers: [WishlistService, UsersService, ProductsService, CategoriesService],
  controllers: [WishlistController],
    imports: [TypeOrmModule.forFeature([Wishlist, User, Product, Category])],
    exports: [WishlistService]
})
export class WishlistModule {}
