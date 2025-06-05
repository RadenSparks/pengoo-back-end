import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UpdateDateColumn } from 'typeorm';

export class UpdateProductDto {
  @IsNotEmpty()
  @IsString()
  product_name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  product_price: number;

  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsString()
  meta_title: string;

  @IsNotEmpty()
  @IsString()
  meta_description: string;

  @IsNotEmpty()
  @IsString()
  image_url: string;

  @IsNotEmpty()
  @IsNumber()
  quantity_sold: number;

  @IsNotEmpty()
  @IsNumber()
  category_ID: number;

  @IsNotEmpty()
  @IsNumber()
  publisher_ID: number;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsString()
  tags: string[];
}
