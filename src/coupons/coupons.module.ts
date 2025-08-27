import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './coupon.entity';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/user.entity';
import { UserCoupon } from './user-coupon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, Product, User, UserCoupon])],
  providers: [CouponsService],
  controllers: [CouponsController],
  exports: [CouponsService],
})
export class CouponsModule {}