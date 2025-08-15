import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './update-orders-status.dto';
import { CreateOrderDto } from './create-orders.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(createOrderDto: CreateOrderDto): Promise<any>;
    updateOrderStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<import("./order.entity").Order>;
    findAllOrders(): Promise<import("./order.entity").Order[]>;
    getDelivery(): Promise<import("../delivery/delivery.entity").Delivery[]>;
    findOrderById(id: string): Promise<import("./order.entity").Order | null>;
    handleOrderSuccess(query: any): Promise<import("./order.entity").Order>;
    handleOrderCancel(query: any): Promise<import("./order.entity").Order | import("@nestjs/common").NotFoundException>;
    removeOrder(id: string): Promise<void>;
}
