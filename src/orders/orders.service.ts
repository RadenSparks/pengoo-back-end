import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderDetail, PaymentStatus, ProductStatus } from './order.entity'; // Import PaymentStatus and ProductStatus
import { CreateOrderDto } from './create-orders.dto';
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
    private invoicesService: InvoicesService, // Inject this
    private dataSource: DataSource, // <-- Inject DataSource
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    const {
      userId,
      delivery_id,
      payment_type,
      shipping_address,
      payment_status,
      productStatus,
      details,
      couponCode,
    } = createOrderDto;

    let total_price = createOrderDto.total_price;

    const userEntity = await this.usersService.findById(userId);
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    const delivery = await this.deliveryRepository.findOne({ where: { id: delivery_id } });
    if (!delivery) throw new NotFoundException('Delivery method not found');

    const orderDetails: OrderDetail[] = [];
    for (const item of details) {
      const product = await this.productsService.findById(item.productId);
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
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
      total_price,
      shipping_address,
      payment_status: payment_status as PaymentStatus,
      productStatus: productStatus as ProductStatus,
      details: orderDetails,
      order_code, // always integer
    });
    let savedOrder = await this.ordersRepository.save(order);
    savedOrder.checkout_url = checkout_url ?? null
    await this.notificationsService.sendOrderConfirmation(userEntity.email, savedOrder.id);
    return savedOrder;
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
    const order = await this.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    await this.ordersRepository.remove(order);
  }
  async getDelivery() {
    return this.deliveryRepository.find();
  }
  async findByPaypalOrderId(paypalOrderId: string): Promise<Order | null> {
    return this.ordersRepository.findOne({ where: { paypal_order_id: paypalOrderId } });
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
}
