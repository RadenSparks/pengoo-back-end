import { CouponStatus } from '../coupon.entity';
export declare class UpdateCouponDto {
    code?: string;
    minOrderValue?: number;
    maxOrderValue?: number;
    startDate?: Date;
    endDate?: Date;
    usageLimit?: number;
    discountPercent?: number;
    status?: CouponStatus;
    productIds?: number[];
    userIds?: number[];
    collectionId?: number;
}
export declare class UpdateCouponStatusDto {
    status: CouponStatus;
}
