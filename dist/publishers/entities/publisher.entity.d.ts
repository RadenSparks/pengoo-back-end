import { Product } from "../../products/product.entity";
export declare class Publisher {
    id: number;
    name: string;
    products: Product[];
    deletedAt?: Date;
}
