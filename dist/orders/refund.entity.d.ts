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
    transaction_id: string;
    status: RefundStatus;
    created_at: Date;
    updated_at: Date;
}
export {};
