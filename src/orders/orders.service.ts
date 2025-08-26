import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderDetail, PaymentStatus, ProductStatus } from './order.entity'; // Import PaymentStatus and ProductStatus
import { CreateOrderDto, CreateRefundRequestDto } from './create-orders.dto';
import { UpdateOrderStatusDto } from './update-orders-status.dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Delivery } from '../delivery/delivery.entity';
import { CouponsService } from '../coupons/coupons.service'; // <-- Add this import
import { PayosService } from '../services/payos/payos.service';
import { CouponStatus } from 'src/coupons/coupon.entity';
import { InvoicesService } from '../services/invoices/invoice.service'; // Add this import
import { Product } from 'src/products/product.entity';
import { RefundRequest, RefundRequestStatus } from './refund-request.entity'; // For status tracking
import { UploadFiles } from './file.entity';
import { ConfigService } from '@nestjs/config'; // Add this import
import { CloudinaryService } from '../services/cloudinary/cloudinary.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly payosService: PayosService,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private orderDetailsRepository: Repository<OrderDetail>,
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
    private usersService: UsersService,
    private productsService: ProductsService,
    private notificationsService: NotificationsService,
    private couponsService: CouponsService,
    private invoicesService: InvoicesService,
    private dataSource: DataSource,
    private configService: ConfigService, // <-- Inject ConfigService here
    private cloudinaryService: CloudinaryService,
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    return await this.dataSource.transaction(async manager => {
      const {
        userId,
        delivery_id,
        payment_type,
        shipping_address,
        payment_status,
        productStatus,
        details,
        couponCode,
        phoneNumber
      } = createOrderDto;

      let total_price = createOrderDto.total_price;

      const userEntity = await this.usersService.findById(userId);
      if (!userEntity) {
        throw new NotFoundException('User not found');
      }

      const delivery = await this.deliveryRepository.findOne({ where: { id: delivery_id } });
      if (!delivery) throw new NotFoundException('Delivery method not found');

      const orderDetails: OrderDetail[] = [];
      for (const item of createOrderDto.details) {
        const product = await manager
          .createQueryBuilder(Product, 'product')
          .setLock('pessimistic_write')
          .where('product.id = :id', { id: item.productId })
          .getOne();

        if (!product) throw new NotFoundException(`Product with ID ${item.productId} not found`);
        if (product.quantity_stock < item.quantity) {
          // Partial fulfillment: return available quantity in error
          throw new BadRequestException({
            message: `Not enough stock for ${product.product_name}`,
            productId: product.id,
            requested: item.quantity,
            available: product.quantity_stock,
            allowPartial: product.quantity_stock > 0,
          });
        }

        // Decrement stock
        product.quantity_stock -= item.quantity;
        await manager.save(product);

        const orderDetail = this.orderDetailsRepository.create({
          product,
          quantity: item.quantity,
          price: item.price,
        });
        orderDetails.push(orderDetail);
      }

      let coupon_id: number | null = null;
      let coupon_code: string | null = null;

      if (couponCode) {
        const { coupon, discount } = await this.couponsService.validateAndApply(
          couponCode,
          total_price,
          userId,
          details.map(d => d.productId)
        );
        total_price = total_price - discount;
        coupon_id = coupon.id;
        coupon_code = coupon.code;
        // coupon.usedCount += 1;
        // if (coupon.usedCount >= coupon.usageLimit) {
        //   coupon.status = CouponStatus.Inactive;
        // }
      }
      let order_code: any = null
      let checkout_url: any = null
      if (payment_type === "payos") {
        const data = await this.createOrderPayOS(2000)
        order_code = data.order_code
        checkout_url = data.checkout_url
      }
      const order: any = this.ordersRepository.create({
        user: userEntity,
        delivery,
        coupon_id,
        coupon_code,
        payment_type,
        phone_number: phoneNumber,
        total_price,
        shipping_address,
        payment_status: payment_status as PaymentStatus,
        productStatus: productStatus as ProductStatus,
        details: orderDetails,
        order_code, // always integer
      });
      const savedOrder = await manager.save(order);
      savedOrder.checkout_url = checkout_url ?? null
      if (order.user && order.user.email) {
        await this.notificationsService.sendOrderConfirmation(order.user.email, order.id);
      }
      return savedOrder;
    });
  }
  generateSafeOrderCode = (): number => {
    const min = 1000000000000;
    const max = 9007199254740991;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  async createOrderPayOS(amount: number) {
    const order_code = Math.floor(this.generateSafeOrderCode())
    const checkout = {
      orderCode: +(order_code),
      amount: 2000,
      description: "Thanh toán đơn hàng",
      cancelUrl: "https://pengoo.store/order/cancel",
      returnUrl: "https://pengoo.store/order/success"
    }
    const result = await this.payosService.createInvoice(checkout);
    return { checkout_url: result.data.checkoutUrl, order_code };

  }
  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({ relations: ['user', 'details', 'details.product', 'delivery', 'details.product.images'] });
  }

  async findById(orderId: number): Promise<Order | null> {
    return this.ordersRepository.findOne({ where: { id: orderId } });
  }
  async findByOrderCode(order_code: number): Promise<Order | null> {
    return this.ordersRepository.findOne({ where: { order_code } });
  }
  async markOrderAsPaidByCode(orderCode: number) {
    const order = await this.ordersRepository.findOne({ where: { order_code: orderCode }, relations: ['user'] });
    if (!order) throw new Error('Order not found');
    order.payment_status = PaymentStatus.Paid;
    order.productStatus = ProductStatus.Pending;

    // Send invoice email
    await this.invoicesService.generateInvoice(order.id);
    return await this.ordersRepository.save(order);
  }

  async handleOrderCancellation(orderCode: number) {
    const order = await this.ordersRepository.findOne({ where: { order_code: orderCode } });
    console.log(`Handling cancellation for order code: ${order?.order_code}`);
    if (!order) {
      // console.warn(`Order ${orderCode} not found during cancellation.`);
      return new NotFoundException('Order not found');
    }
    order.payment_status = PaymentStatus.Canceled;
    order.productStatus = ProductStatus.Cancelled;
    return await this.ordersRepository.save(order);
  }
  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.productStatus = updateOrderStatusDto.productStatus as ProductStatus;
    return this.ordersRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    await this.ordersRepository.softDelete(id);
  }

  async restore(id: number): Promise<void> {
    await this.ordersRepository.restore(id);
  }

  async getDelivery() {
    return this.deliveryRepository.find();
  }
  async findByPaypalOrderId(paypalOrderId: string): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { paypal_order_id: paypalOrderId },
      relations: ['user'], // <-- Ensure 'user' is loaded!
    });
  }

  async save(order: Order): Promise<Order> {
    return this.ordersRepository.save(order);
  }

  async completeOrder(orderId: number) {
    await this.dataSource.transaction(async manager => {
      const order = await manager.findOne(Order, { where: { id: orderId }, relations: ['details', 'details.product'] });
      if (!order) throw new NotFoundException('Order not found');

      for (const detail of order.details) {
        // Lock the product row for update
        const product = await manager
          .createQueryBuilder(Product, 'product')
          .setLock('pessimistic_write')
          .where('product.id = :id', { id: detail.product.id })
          .getOne();

        if (!product) throw new NotFoundException('Product not found');
        if (product.quantity_stock < detail.quantity) {
          throw new BadRequestException(`Not enough stock for ${product.product_name}`);
        }
        product.quantity_stock -= detail.quantity;
        product.quantity_sold += detail.quantity;
        await manager.save(product);
      }

      order.payment_status = PaymentStatus.Paid;
      await manager.save(order);
      // ...send invoice, etc...
    });
  }
  async createRefundRequest(data: CreateRefundRequestDto) {
    const refundRequest = await this.dataSource.transaction(async manager => {
      const order = await manager.findOne(Order, {
        where: { id: data.order_id },
        relations: ['details', 'details.product', 'refundRequests', 'user'],
      });

      if (!order) throw new NotFoundException('Order not found');

      // 1. Only allow refund for delivered orders
      if (order.productStatus !== ProductStatus.Delivered) {
        throw new BadRequestException('Refunds can only be requested for delivered orders.');
      }

      // 2. Check refund window (e.g., 14 days after delivery)
      // Fix: Use order_date as delivered date (or add deliveredAt to Order entity if needed)
      const deliveredAt = order.order_date;
      const REFUND_WINDOW_DAYS = 14;
      const now = new Date();
      const deliveredDate = new Date(deliveredAt);
      if ((now.getTime() - deliveredDate.getTime()) > REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000) {
        throw new BadRequestException('Refund period has expired.');
      }

      // 3. Check if refund already exists and limit requests
      const previousRequests = order.refundRequests || [];
      const pendingRequest = previousRequests.find(r => r.status === RefundRequestStatus.PENDING);
      if (pendingRequest) {
        throw new BadRequestException('There is already a pending refund request for this order.');
      }
      if (previousRequests.length >= 3) {
        throw new BadRequestException('You have reached the maximum number of refund requests for this order.');
      }

      // 4. Validate reason and evidence
      if (!data.reason || data.reason.trim().length < 10) {
        throw new BadRequestException('Please provide a detailed reason for your refund request (at least 10 characters).');
      }
      if (!data.uploadFiles || !Array.isArray(data.uploadFiles) || data.uploadFiles.length === 0) {
        throw new BadRequestException('Please upload at least one evidence file.');
      }

      // 5. Allow partial refund (optional: here, full refund)
      let refundAmount = order.total_price;

      // 6. Prevent duplicate refund for already refunded orders
      if (order.payment_status === PaymentStatus.Refunded) {
        throw new BadRequestException('This order has already been refunded.');
      }

      // 7. Create refund request
      const refundRequest = manager.create(RefundRequest, {
        order,
        reason: data.reason,
        user: { id: data.user_id },
        amount: order.total_price,
        times: (order.refundRequests?.length ?? 0) + 1,
        status: RefundRequestStatus.PENDING,
        paymentMethod: data.paymentMethod, // <-- Store payment method
        toAccountNumber: data.toAccountNumber,
        toBin: data.toBin,
        bank: data.bank,
      });
      await manager.save(refundRequest);

      // 8. Save evidence URLs
      if (Array.isArray(data.uploadFiles)) {
        for (const file of data.uploadFiles) {
          const uploadFile = manager.create(UploadFiles, {
            refundRequest,
            type: file.type,
            url: file.url,
          });
          await manager.save(uploadFile);
        }
      }

      // 9. Select admin emails from users table
      const adminUsers = await manager.find('User', { where: { role: 'admin', status: true } });
      const adminEmails = adminUsers
        .map((user: any) => user.email)
        .filter((email: string | undefined) => !!email);

      // Fallback to config if no admin found
      if (adminEmails.length === 0) {
        adminEmails.push(this.configService.get<string>('ADMIN_EMAIL') || 'admin@pengoo.store');
      }

      const subject = `Refund Request #${refundRequest.id} Created`;
      const message = `
        A new refund request has been created.<br>
        <b>Order ID:</b> ${order.id}<br>
        <b>User:</b> ${order.user?.email || 'Unknown'}<br>
        <b>Reason:</b> ${refundRequest.reason}<br>
        <b>Amount:</b> ${refundRequest.amount}<br>
        <b>Time:</b> ${new Date().toLocaleString()}<br>
      `;
      for (const email of adminEmails) {
        await this.notificationsService.sendEmail(
          email,
          subject,
          `A new refund request has been created for order #${order.id}.`,
          undefined,
          message
        );
      }

      // 10. Audit trail (log action)
      const auditLog = `
        [AUDIT] Refund request created for order ${order.id} by user ${data.user_id}<br>
        <b>Order ID:</b> ${order.id}<br>
        <b>User ID:</b> ${data.user_id}<br>
        <b>User Email:</b> ${order.user?.email || 'Unknown'}<br>
        <b>Reason:</b> ${refundRequest.reason}<br>
        <b>Amount:</b> ${refundRequest.amount}<br>
        <b>Time:</b> ${new Date().toLocaleString()}<br>
      `;
      for (const email of adminEmails) {
        await this.notificationsService.sendEmail(
          email,
          `Audit Log: Refund Request #${refundRequest.id}`,
          `[AUDIT] Refund request created for order ${order.id} by user ${data.user_id}`,
          undefined,
          auditLog
        );
      }

      // Also log to console for local audit
      console.log(`[AUDIT] Refund request created for order ${order.id} by user ${data.user_id}`);

      return refundRequest;
    });

    return {
      status: 200,
      message: 'Refund request created successfully.',
      data: refundRequest,
      estimatedProcessingTime: '3-7 business days',
    };
  }
  async cancelOversoldOrders() {
    const orders = await this.ordersRepository.find({ relations: ['details', 'details.product', 'user'] });
    for (const order of orders) {
      let canFulfill = true;
      for (const detail of order.details) {
        if (detail.product.quantity_stock < detail.quantity) {
          canFulfill = false;
          break;
        }
      }
      if (!canFulfill && order.productStatus !== ProductStatus.Cancelled) {
        order.productStatus = ProductStatus.Cancelled;
        order.payment_status = PaymentStatus.Canceled;
        await this.ordersRepository.save(order);
        // Notify customer
        await this.notificationsService.sendEmail(
          order.user.email,
          'Order Cancelled Due to Insufficient Stock',
          `Your order #${order.id} has been cancelled because we do not have enough stock to fulfill it. Please contact us for alternatives or a refund.`
        );
      }
    }
    return { status: 'done' };
  }
  async updateAddress(id: number, newAddress: string, phoneNumber: string): Promise<Order> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    order.shipping_address = newAddress;
    order.phone_number = phoneNumber;
    return this.ordersRepository.save(order);
  }

  async getRefundRequests(): Promise<RefundRequest[]> {
    return this.dataSource.getRepository(RefundRequest).find({
      relations: ['user', 'order', 'uploadFiles'], // <-- 'uploadFiles' must be here!
      order: { created_at: 'DESC' },
    });
  }
}
