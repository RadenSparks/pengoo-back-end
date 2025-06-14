import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Coupon, CouponStatus } from './coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponsRepository: Repository<Coupon>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const coupon = this.couponsRepository.create(dto);

    if (dto.productIds) {
      coupon.products = await this.productsRepository.findBy({ id: In(dto.productIds) });
    }
    if (dto.userIds) {
      coupon.users = await this.usersRepository.findBy({ id: In(dto.userIds) });
    }

    return this.couponsRepository.save(coupon);
  }

  async validateAndApply(code: string, orderValue: number, userId: number, productIds: number[]): Promise<{coupon: Coupon, discount: number}> {
    const coupon = await this.couponsRepository.findOne({
      where: { code },
      relations: ['products', 'users'],
    });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const now = new Date();
    if (coupon.status !== CouponStatus.Active) throw new BadRequestException('Coupon is not active');
    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) throw new BadRequestException('Coupon is not valid at this time');
    if (orderValue < Number(coupon.minOrderValue) || orderValue > Number(coupon.maxOrderValue)) throw new BadRequestException('Order value not eligible for this coupon');
    if (coupon.usedCount >= coupon.usageLimit) throw new BadRequestException('Coupon usage limit reached');

    // If coupon is restricted to certain users
    if (coupon.users && coupon.users.length > 0 && !coupon.users.some(u => u.id === userId)) {
      throw new BadRequestException('Coupon not valid for this user');
    }

    // If coupon is restricted to certain products
    if (coupon.products && coupon.products.length > 0 && !coupon.products.some(p => productIds.includes(p.id))) {
      throw new BadRequestException('Coupon not valid for these products');
    }

    // Calculate discount
    const discount = (orderValue * Number(coupon.discountPercent)) / 100;

    // Mark as used
    coupon.usedCount += 1;
    if (coupon.usedCount >= coupon.usageLimit) {
      coupon.status = CouponStatus.Inactive;
    }
    await this.couponsRepository.save(coupon);

    return { coupon, discount };
  }
}