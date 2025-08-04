import { PaymentsService } from './payment.service';
import { PaymentMethod } from './payment.types';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    pay(orderId: number, method: PaymentMethod, userId: number, userRole: string): Promise<{
        paypalOrderId: any;
        approvalUrl: any;
    } | {
        message: string;
    }>;
    refundOrder(orderId: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
    cancelOrder(orderId: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
    capturePaypal(orderId: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
}
