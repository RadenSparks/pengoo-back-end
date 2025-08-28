import {
    IsOptional,
    IsString,
    IsNumber,
    IsDateString,
    IsArray,
    IsEnum,
} from 'class-validator';
import { CouponStatus } from '../coupon.entity';
export class UpdateCouponDto {
    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsNumber()
    minOrderValue?: number;

    @IsOptional()
    @IsNumber()
    maxOrderValue?: number;

    @IsOptional()
    @IsDateString()
    startDate?: Date;

    @IsOptional()
    @IsDateString()
    endDate?: Date;

    @IsOptional()
    @IsNumber()
    usageLimit?: number;

    @IsOptional()
    @IsNumber()
    discountPercent?: number;

    @IsOptional()
    @IsEnum(CouponStatus)
    status?: CouponStatus;

    @IsOptional()
    @IsArray()
    productIds?: number[];

    @IsOptional()
    @IsArray()
    userIds?: number[];

    @IsOptional()
    collectionId?: number;
}


export class UpdateCouponStatusDto {
    @IsEnum(CouponStatus)
    status: CouponStatus;
}