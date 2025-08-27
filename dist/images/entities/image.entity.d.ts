import { Product } from '../../products/entities/product.entity';
export declare class Image {
    id: number;
    url: string;
    name: string;
    folder?: string;
    ord?: number;
    product?: Product;
    deletedAt?: Date;
}
