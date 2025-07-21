import { Product } from '../products/product.entity';
export declare class Collection {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    createdAt: Date;
    updatedAt: Date;
    products: Product[];
}
