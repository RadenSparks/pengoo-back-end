import { User } from 'src/users/user.entity';
import { Order } from 'src/orders/order.entity';
import { UploadFiles } from './file.entity';
import { Refund } from './refund.entity';
import { PaymentMethod } from 'src/services/payment/payment.types';
export declare enum RefundRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    REFUNDED = "REFUNDED"
}
export declare class RefundRequest {
    id: number;
    order: Order;
    user: User;
    uploadFiles: UploadFiles[];
    refund: Refund[];
    amount: number;
    reason: string;
    times: number;
    status: RefundRequestStatus;
    created_at: Date;
    updated_at: Date;
    paymentMethod: PaymentMethod;
    toAccountNumber: string;
    toBin: string;
    bank: string;
}
