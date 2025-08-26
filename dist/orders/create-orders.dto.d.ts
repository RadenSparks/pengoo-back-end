import { PaymentMethod } from '../services/payment/payment.types';
declare class CreateOrderDetailDto {
    productId: number;
    quantity: number;
    price: number;
}
export declare class CreateRefundRequestDto {
    order_id: number;
    user_id: number;
    reason: string;
    uploadFiles: {
        type: string;
        url: string;
    }[];
    paymentMethod: PaymentMethod;
    toAccountNumber: string;
    toBin: string;
    bank: string;
}
export declare class CreateOrderDto {
    userId: number;
    delivery_id: number;
    phoneNumber: string;
    payment_type: PaymentMethod;
    total_price: number;
    shipping_address: string;
    payment_status?: string;
    productStatus?: string;
    couponCode?: string;
    details: CreateOrderDetailDto[];
}
export {};
