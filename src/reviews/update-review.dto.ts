import { IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';

export class UpdateReviewDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsString()
  content: string; // Use 'content' for consistency
}
