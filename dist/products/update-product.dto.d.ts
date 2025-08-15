export declare class FeatureDto {
    title: string;
    content: string;
    ord: number;
}
export declare class UpdateProductDto {
    product_name: string;
    description: string;
    featured: FeatureDto[];
    product_price: number;
    discount: number;
    slug: string;
    meta_title: string;
    meta_description: string;
    mainImage?: any;
    detailImages?: any[];
    quantity_sold: number;
    quantity_stock: number;
    category_ID: number;
    publisherID: number;
    status: string;
    tags?: string[] | string;
    cms_content?: any;
    deleteImages?: number[] | number;
}
