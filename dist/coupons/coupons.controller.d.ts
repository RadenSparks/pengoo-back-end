import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { Repository } from 'typeorm';
import { UserCoupon } from './user-coupon.entity';
import { UpdateCouponDto } from './dto/update-coupon.dto';
export declare class CouponsController {
    private readonly couponsService;
    private userCouponRepo;
    constructor(couponsService: CouponsService, userCouponRepo: Repository<UserCoupon>);
    create(dto: CreateCouponDto): Promise<import("./coupon.entity").Coupon>;
    validate(body: {
        code: string;
        orderValue: number;
        productIds: number[];
    }, req: any): Promise<{
        coupon: import("./coupon.entity").Coupon;
        discount: number;
    }>;
    redeemCoupon(token: string): Promise<{
        message: string;
        coupon: string;
    }>;
    update(id: number, dto: UpdateCouponDto): Promise<import("./coupon.entity").Coupon>;
    getAll(): Promise<import("./coupon.entity").Coupon[] | undefined>;
    delete(id: number): Promise<import("./coupon.entity").Coupon>;
    updateStatus(id: number, status: any): Promise<import("./coupon.entity").Coupon>;
    getNextMilestoneCoupon(req: any, userPoints: number): Promise<{
        coupon: null;
    } | {
        coupon: {
            code: string;
            discount: number;
        };
    }>;
    getMilestoneCoupons(): Promise<{
        coupons: import("./coupon.entity").Coupon[];
    }>;
    getMyVouchers(req: any): Promise<{
        vouchers: UserCoupon[];
    }>;
    checkVoucherByUserPoint(req: any, data: {
        voucherCode: string;
    }): Promise<UserCoupon[]>;
    getVoucherByUserId(req: any): Promise<UserCoupon[]>;
    getSpecialCollectionDiscount(body: {
        productIds: number[];
    }): Promise<{
        discountPercent: number;
        collectionId: null;
    } | {
        discountPercent: number;
        collectionId: number;
    }>;
}
