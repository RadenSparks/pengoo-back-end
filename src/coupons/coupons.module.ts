import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './coupon.entity';
import { UserCoupon } from './user-coupon.entity';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { Product } from '../products/entities/product.entity';
import { Collection } from '../collections/collection.entity'; // <-- import Collection

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, UserCoupon, Product, Collection]), // <-- add Collection here
  ],
  providers: [CouponsService],
  controllers: [CouponsController],
  exports: [CouponsService],
})
export class CouponsModule {}