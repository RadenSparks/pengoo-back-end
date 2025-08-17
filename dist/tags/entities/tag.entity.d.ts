import { Product } from "../../products/product.entity";
export declare class Tag {
    id: number;
    name: string;
    type: string;
    products: Product[];
    deletedAt?: Date;
}
