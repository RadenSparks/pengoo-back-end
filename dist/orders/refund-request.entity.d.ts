import { User } from 'src/users/user.entity';
import { Order } from 'src/orders/order.entity';
import { UploadFiles } from './file.entity';
import { Refund } from './refund.entity';
declare enum RefundRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
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
}
export {};
