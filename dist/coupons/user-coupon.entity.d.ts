import { User } from '../users/user.entity';
import { Coupon } from './coupon.entity';
export declare class UserCoupon {
    id: number;
    user: User;
    coupon: Coupon;
    redeemed: boolean;
    redeemedAt: Date | null;
    redeemToken: string | null;
    deletedAt?: Date;
}
