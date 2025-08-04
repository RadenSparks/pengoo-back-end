import { Repository, DataSource } from 'typeorm';
import { Order } from '../../orders/order.entity';
import { PaymentMethod } from './payment.types';
import { PaypalService } from '../paypal/paypal.service';
import { PayosService } from '../payos/payos.service';
import { InvoicesService } from '../invoices/invoice.service';
export declare class PaymentsService {
    private ordersRepository;
    private paypalService;
    private dataSource;
    private payosService;
    private invoicesService;
    constructor(ordersRepository: Repository<Order>, paypalService: PaypalService, dataSource: DataSource, payosService: PayosService, invoicesService: InvoicesService);
    private assertCanAct;
    pay(orderId: number, method: PaymentMethod, userId: number, userRole: string): Promise<{
        paypalOrderId: any;
        approvalUrl: any;
    } | {
        message: string;
    }>;
    handlePaypalCapture(orderId: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
    handlePayosCapture(orderId: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
    refundOrder(orderId: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
    cancelOrder(orderId: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
}
