import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './update-orders-status.dto';
import { CreateOrderDto } from './create-orders.dto';
import { Response } from 'express';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(createOrderDto: CreateOrderDto): Promise<any>;
    updateOrderStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<import("./order.entity").Order>;
    findAllOrders(): Promise<import("./order.entity").Order[]>;
    getDelivery(): Promise<import("../delivery/delivery.entity").Delivery[]>;
    findOrderById(id: number): Promise<import("./order.entity").Order | null>;
    handleOrderSuccess(query: any, res: Response): Promise<void | Response<any, Record<string, any>>>;
    handleOrderCancel(query: any, res: Response): Promise<void>;
    removeOrder(id: number): Promise<void>;
}
