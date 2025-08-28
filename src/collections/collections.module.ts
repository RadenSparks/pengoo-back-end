import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { Collection } from './collection.entity';
import { Product } from '../products/entities/product.entity';
import { CouponsModule } from '../coupons/coupons.module'; // <-- import CouponsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Collection, Product]),
    CouponsModule, // <-- add this line
  ],
  providers: [CollectionsService],
  controllers: [CollectionsController],
  exports: [CollectionsService],
})
export class CollectionsModule {}