export class CreateCollectionDto {
  name: string;
  slug: string;
  image_url?: string;
  productIds?: number[];
  hasSpecialCoupon?: boolean;
  baseDiscountPercent?: number;
  incrementPerExpansion?: number;
  specialCouponId?: number; // <-- add this
}