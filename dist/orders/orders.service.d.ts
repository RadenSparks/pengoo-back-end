import { NotFoundException } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderDetail } from './order.entity';
import { CreateOrderDto, CreateRefundRequestDto } from './create-orders.dto';
import { UpdateOrderStatusDto } from './update-orders-status.dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Delivery } from '../delivery/delivery.entity';
import { CouponsService } from '../coupons/coupons.service';
import { PayosService } from '../services/payos/payos.service';
import { InvoicesService } from '../services/invoices/invoice.service';
import { RefundRequest } from './refund-request.entity';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from '../services/cloudinary/cloudinary.service';
export declare class OrdersService {
    private readonly payosService;
    private ordersRepository;
    private orderDetailsRepository;
    private deliveryRepository;
    private usersService;
    private productsService;
    private notificationsService;
    private couponsService;
    private invoicesService;
    private dataSource;
    private configService;
    private cloudinaryService;
    constructor(payosService: PayosService, ordersRepository: Repository<Order>, orderDetailsRepository: Repository<OrderDetail>, deliveryRepository: Repository<Delivery>, usersService: UsersService, productsService: ProductsService, notificationsService: NotificationsService, couponsService: CouponsService, invoicesService: InvoicesService, dataSource: DataSource, configService: ConfigService, cloudinaryService: CloudinaryService);
    create(createOrderDto: CreateOrderDto): Promise<any>;
    generateSafeOrderCode: () => number;
    createOrderPayOS(amount: number): Promise<{
        checkout_url: any;
        order_code: number;
    }>;
    findAll(): Promise<Order[]>;
    findById(orderId: number): Promise<Order | null>;
    findByOrderCode(order_code: number): Promise<Order | null>;
    markOrderAsPaidByCode(orderCode: number): Promise<Order>;
    handleOrderCancellation(orderCode: number): Promise<Order | NotFoundException>;
    updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order>;
    remove(id: number): Promise<void>;
    restore(id: number): Promise<void>;
    getDelivery(): Promise<Delivery[]>;
    findByPaypalOrderId(paypalOrderId: string): Promise<Order | null>;
    save(order: Order): Promise<Order>;
    completeOrder(orderId: number): Promise<void>;
    createRefundRequest(data: CreateRefundRequestDto): Promise<{
        status: number;
        message: string;
        data: RefundRequest;
        estimatedProcessingTime: string;
    }>;
    cancelOversoldOrders(): Promise<{
        status: string;
    }>;
    updateAddress(id: number, newAddress: string, phoneNumber: string): Promise<Order>;
    getRefundRequests(): Promise<RefundRequest[]>;
}
