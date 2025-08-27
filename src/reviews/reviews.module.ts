import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './review.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { PublishersModule } from '../publishers/publishers.module';
import { CloudinaryModule } from '../services/cloudinary/cloudinary.module';
import { TagsModule } from '../tags/tags.module';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { Order } from '../orders/order.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      User,
      Product,
      Order,
      Category,
      Tag,
    ]),
    PublishersModule,
    CloudinaryModule,
    TagsModule,
    UsersModule,
    OrdersModule,
    ProductsModule,
  ],
  providers: [ReviewsService],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
