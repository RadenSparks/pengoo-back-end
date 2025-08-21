import { OrdersService } from '../../orders/orders.service';
import { ConfigService } from '@nestjs/config';
import { InvoicesService } from '../invoices/invoice.service';
export declare class PaypalService {
    private ordersService;
    private configService;
    private invoicesService;
    private environment;
    private client;
    constructor(ordersService: OrdersService, configService: ConfigService, invoicesService: InvoicesService);
    createOrder(orderId: number): Promise<{
        paypalOrderId: any;
        approvalUrl: any;
    }>;
    captureOrder(paypalOrderId: string): Promise<any>;
    refundOrder(orderId: number): Promise<any>;
}
