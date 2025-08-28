import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreatePostDto {
  @IsString()
  name: string;

  @IsString()
  canonical: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  meta_description?: string;

  @IsOptional()
  @IsString()
  meta_keyword?: string;

  @IsOptional()
  @IsString()
  meta_title?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNumber()
  order: number; // <-- Now required

  @IsOptional()
  @IsBoolean()
  publish?: boolean;

  @IsNumber()
  catalogueId: number;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsString()
  bgColor?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsString()
  fontSize?: string;
}