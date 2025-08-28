export class UpdateCollectionDto {
  name?: string;
  slug?: string;
  image_url?: string;
  productIds?: number[];
  hasSpecialCoupon?: boolean;
  baseDiscountPercent?: number;
  incrementPerExpansion?: number;
}