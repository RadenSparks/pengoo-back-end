import { PaypalService } from './paypal.service';
export declare class PaypalController {
    private readonly paypalService;
    constructor(paypalService: PaypalService);
    createPaypalOrder(orderId: number): Promise<{
        paypalOrderId: any;
        approvalUrl: any;
    }>;
    capturePaypalOrder(paypalOrderId: string): Promise<any>;
}
