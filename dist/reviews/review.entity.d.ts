import { User } from '../users/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/order.entity';
export declare class Review {
    id: number;
    rating: number;
    content: string;
    createdAt: Date;
    user: User;
    product: Product;
    order: Order;
    status: 'Visible' | 'Hidden';
}
