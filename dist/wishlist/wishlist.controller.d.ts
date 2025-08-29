import { WishlistService } from './wishlist.service';
interface WishlistBody {
    userId: number;
}
export declare class WishlistController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    addToWishlist(body: WishlistBody, productId: string): Promise<import("./wishlist.entity").Wishlist>;
    removeFromWishlist(body: WishlistBody, productId: string): Promise<void>;
    viewWishlist(userId: number): Promise<{
        product: any;
        id: number;
        user: import("../users/user.entity").User;
        createdAt: Date;
        movedToOrder: import("../orders/order.entity").Order | null;
    }[]>;
    moveToOrder(body: WishlistBody, orderId: string): Promise<{
        moved: number;
    }>;
}
export {};
