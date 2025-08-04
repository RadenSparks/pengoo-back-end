import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderDetail } from './order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';
import { CategoriesService } from '../categories/categories.service';
import { PublishersModule } from '../publishers/publishers.module';
import { CloudinaryModule } from '../services/cloudinary/cloudinary.module';
import { TagsModule } from '../tags/tags.module';
import { Tag } from '../tags/entities/tag.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Delivery } from '../delivery/delivery.entity';
import { CouponsModule } from '../coupons/coupons.module';
import { Image } from '../products/entities/image.entity';
import { PayosService } from '../services/payos/payos.service';
import { CmsContentModule } from '../cms-content/cms-content.module';
import { ProductsModule } from '../products/products.module';
import { InvoicesModule } from '../services/invoices/invoices.module';

@Module({
  providers: [
    OrdersService,
    UsersService,
    CategoriesService,
    PayosService
  ],
  controllers: [OrdersController],
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderDetail,
      User,
      Product,
      Category,
      Tag,
      Delivery,
      Image,
    ]),
    PublishersModule,
    CloudinaryModule,
    TagsModule,
    NotificationsModule,
    CouponsModule,
    CmsContentModule,
    ProductsModule,
    InvoicesModule,
  ],
  exports: [OrdersService]
})
export class OrdersModule { }