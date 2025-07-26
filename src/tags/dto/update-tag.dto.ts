import { PartialType } from '@nestjs/swagger';
import { CreateTagDto } from './create-tag.dto';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateTagDto extends PartialType(CreateTagDto) {
    @IsOptional()
    @IsString()
    @IsIn(['genre', 'players', 'duration', 'age']) // <-- Add 'age'
    type?: string;
}
