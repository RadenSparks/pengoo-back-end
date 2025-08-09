import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @MinLength(3)
  full_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phone_number?: string;

  @IsOptional()
  avatar_url?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  role?: string;
}