import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { Delivery } from '../delivery/delivery.entity';
import { Review } from '../reviews/review.entity';
import { Wishlist } from '../wishlist/wishlist.entity';
export declare enum PaymentStatus {
    Paid = "paid",
    Pending = "pending",
    PendingOnDelivery = "pending_on_delivery",
    Refunded = "refunded",
    Success = "success",
    Canceled = "canceled"
}
export declare enum ProductStatus {
    Pending = "pending",
    Cancelled = "cancelled",
    Shipped = "shipped",
    Delivered = "delivered"
}
export declare class Order {
    id: number;
    user: User;
    delivery: Delivery;
    coupon_id: number | null;
    coupon_code: string | null;
    payment_type: string;
    order_date: Date;
    total_price: number;
    order_code: number;
    shipping_address: string;
    payment_status: PaymentStatus;
    productStatus: string;
    paypal_order_id: string | null;
    details: OrderDetail[];
    reviews: Review[];
    wishlistItems: Wishlist[];
}
export declare class OrderDetail {
    id: number;
    order: Order;
    product: Product;
    quantity: number;
    price: number;
    get total(): number;
}
