import { User } from '../users/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/order.entity';
export declare class Wishlist {
    id: number;
    user: User;
    product: Product;
    createdAt: Date;
    movedToOrder: Order | null;
}
