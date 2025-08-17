import { UserCoupon } from './user-coupon.entity';
export declare enum CouponStatus {
    Active = "active",
    Inactive = "inactive",
    Expired = "expired"
}
export declare class Coupon {
    id: number;
    code: string;
    minOrderValue: number;
    maxOrderValue: number;
    startDate: Date;
    endDate: Date;
    usageLimit: number;
    usedCount: number;
    status: CouponStatus;
    discountPercent: number;
    description?: string;
    userCoupons: UserCoupon[];
    milestonePoints: number | null;
    deletedAt?: Date;
}
