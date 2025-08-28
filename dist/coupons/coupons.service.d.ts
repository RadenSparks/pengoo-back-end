import { Repository } from 'typeorm';
import { Coupon, CouponStatus } from './coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UserCoupon } from './user-coupon.entity';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { User } from '../users/user.entity';
import { Product } from '../products/entities/product.entity';
import { Collection } from '../collections/collection.entity';
export declare class CouponsService {
    private couponsRepo;
    private userCouponRepo;
    private productsRepo;
    private collectionsRepo;
    constructor(couponsRepo: Repository<Coupon>, userCouponRepo: Repository<UserCoupon>, productsRepo: Repository<Product>, collectionsRepo: Repository<Collection>);
    create(dto: CreateCouponDto): Promise<Coupon>;
    getSpecialCollectionDiscount(productIds: number[]): Promise<{
        discountPercent: number;
        collectionId: number;
    } | {
        discountPercent: number;
        collectionId: null;
    }>;
    validateAndApply(code: string, orderValue: number, userId: number, productIds: number[]): Promise<{
        coupon: Coupon;
        discount: number;
    }>;
    findActiveCoupon(): Promise<Coupon | undefined>;
    getAll(): Promise<Coupon[] | undefined>;
    getNextAvailableCoupon(userId: number, userPoints: number): Promise<Coupon | null>;
    getMilestoneCoupons(): Promise<Coupon[]>;
    update(id: number, dto: UpdateCouponDto): Promise<Coupon>;
    updateStatus(id: number, status: CouponStatus): Promise<Coupon>;
    delete(id: number): Promise<Coupon>;
    checkVoucherByUserPoint(user: User, voucherCode: string): Promise<UserCoupon[]>;
    handleSaveCouponForUser(userId: any, voucherId: any): Promise<UserCoupon>;
    getVoucherByUserId(id: number): Promise<UserCoupon[]>;
    remove(id: number): Promise<{
        deleted: boolean;
    }>;
    restore(id: number): Promise<{
        restored: boolean;
    }>;
}
