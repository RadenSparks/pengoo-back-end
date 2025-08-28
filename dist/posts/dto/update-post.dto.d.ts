import { CreatePostDto } from './create-post.dto';
declare const UpdatePostDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreatePostDto>>;
export declare class UpdatePostDto extends UpdatePostDto_base {
    order?: number;
    textColor?: string;
    bgColor?: string;
    fontFamily?: string;
    fontSize?: string;
}
export {};
