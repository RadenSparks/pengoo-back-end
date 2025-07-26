import { IsNotEmpty, IsString, IsIn } from "class-validator";

export class CreateTagDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(['genre', 'players', 'duration', 'age']) // <-- Add 'age'
    type: string;
}
