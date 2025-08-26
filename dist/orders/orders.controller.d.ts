import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './update-orders-status.dto';
import { CreateOrderDto, CreateRefundRequestDto } from './create-orders.dto';
import { RefundRequest } from './refund-request.entity';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(createOrderDto: CreateOrderDto): Promise<any>;
    updateOrderStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<import("./order.entity").Order>;
    findAllOrders(): Promise<import("./order.entity").Order[]>;
    getDelivery(): Promise<import("../delivery/delivery.entity").Delivery[]>;
    findOrderById(id: string): Promise<import("./order.entity").Order | null>;
    findOrderByOrderCode(order_code: string): Promise<import("./order.entity").Order | null>;
    handleOrderSuccess(query: any): Promise<import("./order.entity").Order>;
    handleOrderCancel(query: any): Promise<import("./order.entity").Order | import("@nestjs/common").NotFoundException>;
    removeOrder(id: string): Promise<void>;
    restore(id: number): Promise<{
        message: string;
    }>;
    createRefundRequest(body: CreateRefundRequestDto, files: Express.Multer.File[]): Promise<{
        status: number;
        message: string;
        data: RefundRequest;
        estimatedProcessingTime: string;
    }>;
    cancelOversoldOrders(): Promise<{
        status: string;
    }>;
    updateOrderAddress(id: string, body: {
        shipping_address: string;
        phone_number: string;
    }): Promise<import("./order.entity").Order>;
    getRefundRequests(): Promise<RefundRequest[]>;
}
