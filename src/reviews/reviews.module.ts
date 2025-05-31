import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';
import { CategoriesService } from 'src/categories/categories.service';
import { Category } from 'src/categories/category.entity';
import { ProductsService } from 'src/products/products.service';

@Module({
  providers: [ReviewsService, UsersService, ProductsService, CategoriesService],
  controllers: [ReviewsController],
  imports: [TypeOrmModule.forFeature([Review, User, Product, Category])],
  exports: [ReviewsService]
})
export class ReviewsModule { }
