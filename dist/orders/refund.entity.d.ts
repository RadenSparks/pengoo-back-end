import { PaymentMethod } from 'src/services/payment/payment.types';
import { RefundRequest } from './refund-request.entity';
declare enum RefundStatus {
    PROCESSING = "PROCESSING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED"
}
export declare class Refund {
    id: number;
    refundRequest: RefundRequest;
    amount: number;
    paymentMethod: PaymentMethod;
    toAccountNumber: string;
    toBin: string;
    bank: string;
    transaction_id: string;
    status: RefundStatus;
    created_at: Date;
    updated_at: Date;
}
export {};
