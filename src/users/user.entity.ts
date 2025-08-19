
import { Review } from '../reviews/review.entity';
import { Wishlist } from '../wishlist/wishlist.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, } from 'typeorm';
import { TicketEarningLog } from '../minigame/ticket-earning-log.entity';
import { UserCoupon } from '../coupons/user-coupon.entity';
import { RefundRequest } from 'src/orders/refund-request.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, nullable: false })
  username: string;

  @Column({ length: 100, nullable: false })
  full_name: string;

  @Column({ type: 'text', nullable: false })
  password: string;

  @Column({ length: 100, unique: true, nullable: false })
  email: string;

  @Column({ length: 50, nullable: false, default: 'user' })
  role: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number: string;

  @Column({ type: 'text', nullable: true })
  avatar_url: string;

  @Column({ nullable: false, default: true })
  status: boolean;

  @Column({ type: 'text', nullable: true })
  address: string;

  // Mini_game-Intergration fields
  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 3 }) // Default starting tickets
  minigame_tickets: number;

  // Password reset fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @OneToMany(() => Wishlist, wishlist => wishlist.user)
  wishlists: Wishlist[];

  @OneToMany(() => TicketEarningLog, log => log.user)
  ticketEarningLogs: TicketEarningLog[];

  @OneToMany(() => UserCoupon, uc => uc.user)
  userCoupons: UserCoupon[];

  @OneToMany(() => RefundRequest, rf => rf.order)
  refundRequests: RefundRequest[];

  @Column({ type: 'date', nullable: true })
  lastFreeTicketClaim: Date | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  mfaCode: string | null;

  @Column({ type: 'timestamp', nullable: true })
  mfaCodeExpires: Date | null;

  @Column({ length: 20, default: 'local' })
  provider: string;
}