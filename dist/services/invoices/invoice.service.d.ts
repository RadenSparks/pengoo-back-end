import { Order } from '../../orders/order.entity';
import { Repository } from 'typeorm';
import { NotificationsService } from '../../notifications/notifications.service';
export declare class InvoicesService {
    private ordersRepository;
    private notificationsService;
    constructor(ordersRepository: Repository<Order>, notificationsService: NotificationsService);
    generateInvoice(orderId: number): Promise<string>;
}
