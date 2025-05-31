import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderItem } from './order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';
import { Category } from 'src/categories/category.entity';
import { CategoriesService } from 'src/categories/categories.service';

@Module({
  providers: [OrdersService, UsersService, ProductsService, CategoriesService],
  controllers: [OrdersController],
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User, Product,Category])],
  exports: [OrdersService]
})
export class OrdersModule {}
