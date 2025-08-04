import { Repository } from 'typeorm';
import { Order, OrderDetail } from './order.entity';
import { CreateOrderDto } from './create-orders.dto';
import { UpdateOrderStatusDto } from './update-orders-status.dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Delivery } from '../delivery/delivery.entity';
import { CouponsService } from '../coupons/coupons.service';
import { PayosService } from '../services/payos/payos.service';
export declare class OrdersService {
    private readonly payosService;
    private ordersRepository;
    private orderDetailsRepository;
    private deliveryRepository;
    private usersService;
    private productsService;
    private notificationsService;
    private couponsService;
    constructor(payosService: PayosService, ordersRepository: Repository<Order>, orderDetailsRepository: Repository<OrderDetail>, deliveryRepository: Repository<Delivery>, usersService: UsersService, productsService: ProductsService, notificationsService: NotificationsService, couponsService: CouponsService);
    create(createOrderDto: CreateOrderDto): Promise<any>;
    generateSafeOrderCode: () => number;
    createOrderPayOS(amount: number): Promise<{
        checkout_url: any;
        order_code: number;
    }>;
    findAll(): Promise<Order[]>;
    findById(orderId: number): Promise<Order | null>;
    markOrderAsPaidByCode(orderCode: number): Promise<void>;
    handleOrderCancellation(orderCode: number): Promise<void>;
    updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order>;
    remove(id: number): Promise<void>;
    getDelivery(): Promise<Delivery[]>;
    findByPaypalOrderId(paypalOrderId: string): Promise<Order | null>;
    save(order: Order): Promise<Order>;
}
