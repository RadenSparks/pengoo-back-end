import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FeatureDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  ord: number;
}

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  product_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ type: [FeatureDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  featured: FeatureDto[];

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  product_price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  meta_title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  meta_description: string;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  mainImage?: any;

  @ApiProperty({ required: false, type: 'array', items: { type: 'string', format: 'binary' } })
  @IsOptional()
  detailImages?: any[];

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity_sold: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity_stock: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  category_ID: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  publisherID: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  tags?: string[] | string;

  deleteImages?: number[] | number;

  @ApiProperty()
  @IsOptional()
  cms_content?: any;
}