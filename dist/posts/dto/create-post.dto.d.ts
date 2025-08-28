export declare class CreatePostDto {
    name: string;
    canonical: string;
    description?: string;
    content: string;
    meta_description?: string;
    meta_keyword?: string;
    meta_title?: string;
    image?: string;
    order: number;
    publish?: boolean;
    catalogueId: number;
    textColor?: string;
    bgColor?: string;
    fontFamily?: string;
    fontSize?: string;
}
