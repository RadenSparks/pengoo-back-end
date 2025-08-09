import { NotificationsService } from '../../notifications/notifications.service';
import { Order } from '../../orders/order.entity';
import { Repository } from 'typeorm';
export declare class InvoicesService {
    private ordersRepository;
    private notificationsService;
    constructor(ordersRepository: Repository<Order>, notificationsService: NotificationsService);
    generateInvoice(orderId: number): Promise<void>;
    createInvoicePdf(order: Order): Promise<string>;
    createInvoicePdfByOrderId(orderId: number): Promise<string>;
    getOrderWithDetails(orderId: number): Promise<Order | null>;
    canDownloadInvoice(order: Order): boolean;
}
