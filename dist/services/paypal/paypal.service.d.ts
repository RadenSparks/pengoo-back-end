import { OrdersService } from '../../orders/orders.service';
import { ConfigService } from '@nestjs/config';
import { InvoicesService } from '../invoices/invoice.service';
export declare class PaypalService {
    private ordersService;
    private configService;
    private invoicesService;
    private clientId;
    private clientSecret;
    private apiBase;
    constructor(ordersService: OrdersService, configService: ConfigService, invoicesService: InvoicesService);
    private getAccessToken;
    createOrder(orderId: number): Promise<{
        paypalOrderId: any;
        approvalUrl: any;
    }>;
    captureOrder(paypalOrderId: string): Promise<any>;
    refundOrder(orderId: number): Promise<any>;
}
