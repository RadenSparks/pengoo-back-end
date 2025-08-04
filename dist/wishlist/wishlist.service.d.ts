import { Repository } from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
export declare class WishlistService {
    private wishlistRepository;
    private usersService;
    private productsService;
    private ordersService;
    constructor(wishlistRepository: Repository<Wishlist>, usersService: UsersService, productsService: ProductsService, ordersService: OrdersService);
    addToWishlist(userId: number, productId: number): Promise<Wishlist>;
    removeFromWishlist(userId: number, productId: number): Promise<void>;
    viewWishlist(userId: number): Promise<Wishlist[]>;
    moveWishlistToOrder(userId: number, orderId: number): Promise<{
        moved: number;
    }>;
    viewWishlistIds(userId: number): Promise<number[]>;
}
