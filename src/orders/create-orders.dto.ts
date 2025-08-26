import { IsNotEmpty, IsNumber, IsArray, ArrayNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethod } from '../services/payment/payment.types';

class CreateOrderDetailDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
export class CreateRefundRequestDto {
  @IsNotEmpty()
  @IsNumber()
  order_id: number;

  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  uploadFiles: {
    type: string; // 'image' | 'video'
    url: string;
  }[];

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  @IsString()
  toAccountNumber: string;

  @IsNotEmpty()
  @IsString()
  toBin: string;

  @IsNotEmpty()
  @IsString()
  bank: string;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  delivery_id: number;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  payment_type: PaymentMethod;

  @IsNotEmpty()
  @IsNumber()
  total_price: number;

  @IsNotEmpty()
  @IsString()
  shipping_address: string;

  @IsOptional()
  @IsString()
  payment_status?: string;

  @IsOptional()
  @IsString()
  productStatus?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  details: CreateOrderDetailDto[];
}
