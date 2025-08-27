import { Product } from '../products/entities/product.entity';
export declare class Category {
    id: number;
    name: string;
    description: string;
    products: Product[];
    deletedAt?: Date;
}
