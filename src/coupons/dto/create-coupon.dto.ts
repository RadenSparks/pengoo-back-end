import { IsNotEmpty, IsNumber, IsString, IsDateString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { CouponStatus } from '../coupon.entity';

export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNumber()
  minOrderValue: number;

  @IsNumber()
  maxOrderValue: number;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsNumber()
  usageLimit: number;

  @IsNumber()
  discountPercent: number;

  @IsEnum(CouponStatus)
  status: CouponStatus;

  @IsOptional()
  collectionId?: number;

  @IsOptional()
  @IsArray()
  productIds?: number[];

  @IsOptional()
  @IsArray()
  userIds?: number[];
}