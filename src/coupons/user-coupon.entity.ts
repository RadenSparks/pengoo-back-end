import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Coupon } from './coupon.entity';

@Entity()
@Unique(['user', 'coupon'])
export class UserCoupon {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.userCoupons)
  user: User;

  @ManyToOne(() => Coupon, coupon => coupon.userCoupons)
  coupon: Coupon;

  @Column({ default: false })
  redeemed: boolean;

  @Column({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  redeemedAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  redeemToken: string | null;
}