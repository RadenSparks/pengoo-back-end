import { Product } from '../products/entities/product.entity';
import { Coupon } from '../coupons/coupon.entity';
export declare class Collection {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    hasSpecialCoupon: boolean;
    baseDiscountPercent: number;
    incrementPerExpansion: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    products: Product[];
    specialCoupon?: Coupon;
    specialCouponId?: number;
}
