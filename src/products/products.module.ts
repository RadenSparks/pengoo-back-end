import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Category } from '../categories/category.entity';
import { Product } from './product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from 'src/categories/categories.service';

@Module({
  providers: [ProductsService, CategoriesService],
  controllers: [ProductsController],
  imports: [TypeOrmModule.forFeature([Product, Category])],
  exports: [ProductsService]
})
export class ProductsModule {}
