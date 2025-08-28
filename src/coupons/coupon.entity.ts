import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn, ManyToOne } from 'typeorm';
import { UserCoupon } from './user-coupon.entity';
import { Collection } from '../collections/collection.entity';

export enum CouponStatus {
  Active = 'active',
  Inactive = 'inactive',
  Expired = 'expired',
}

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column('decimal')
  minOrderValue: number;

  @Column('decimal')
  maxOrderValue: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column('int')
  usageLimit: number;

  @Column('int', { default: 0 })
  usedCount: number;

  @Column({ type: 'enum', enum: CouponStatus, default: CouponStatus.Active })
  status: CouponStatus;

  @Column('decimal')
  discountPercent: number;

  @Column('text')
  description?: string;

  // Removed product and user restrictions

  @OneToMany(() => UserCoupon, uc => uc.coupon)
  userCoupons: UserCoupon[];

  @Column({ type: 'int', nullable: true })
  milestonePoints: number | null; // Points required to unlock this coupon

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => Collection, { nullable: true, onDelete: 'SET NULL' })
  collection: Collection;

  @Column({ type: 'int', nullable: true })
  collectionId: number | null;
}
