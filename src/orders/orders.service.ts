import { Injectable, NotFoundException, BadRequestException, Res, Req } from '@nestjs/common';
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
import { Product } from 'src/products/entities/product.entity';
import { RefundRequest, RefundRequestStatus } from './refund-request.entity'; // For status tracking
import { UploadFiles } from './file.entity';
import { ConfigService } from '@nestjs/config'; // Add this import
import { CloudinaryService } from '../services/cloudinary/cloudinary.service';
import { PaymentMethod } from 'src/services/payment/payment.types';
import { pengooEmailTemplate } from '../notifications/notifications.service';

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
            message: `Không đủ hàng cho ${product.product_name}`,
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
        console.log(discount, total_price)
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
      console.log(total_price)
      const savedOrder = await manager.save(order);
      savedOrder.checkout_url = checkout_url ?? null
      // After order is created, send confirmation email using the template
      if (order.user && order.user.email) {
        await this.notificationsService.sendEmail(
          order.user.email,
          'Xác nhận đơn hàng từ Pengoo',
          `Đơn hàng của bạn với mã số ${order.id} đã được xác nhận.`,
          undefined,
          pengooEmailTemplate({
            title: 'Xác nhận đơn hàng',
            message: `Đơn hàng của bạn với mã số <b>${order.id}</b> đã được xác nhận. Cảm ơn bạn đã mua sắm tại Pengoo!`,
            logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755175429/logopengoo_tjwzhh.png',
          })
        );
      }

      // After order is created, update product quantities
      for (const detail of createOrderDto.details) {
        const product = await manager.findOne(Product, { where: { id: detail.productId } });
        if (!product) throw new NotFoundException(`Sản phẩm ${detail.productId} không tìm thấy`);
        if (product.quantity_stock < detail.quantity) {
          throw new BadRequestException(`Không đủ hàng cho sản phẩm ${product.product_name}`);
        }
        product.quantity_sold += detail.quantity;
        product.quantity_stock -= detail.quantity;
        await manager.save(product);
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
  async findByUserId(id): Promise<Order[] | null> {
    return this.ordersRepository.find({
      where: { user: { id } },
      relations: ['user', 'details', 'details.product', 'delivery', 'details.product.images'],
      order: { id: 'DESC' }
    });
  }
  async findByOrderCode(order_code: number): Promise<Order | null> {
    return this.ordersRepository.findOne({ where: { order_code } });
  }
  async markOrderAsPaidByCode(orderCode: number) {
    const order = await this.ordersRepository.findOne({ where: { order_code: orderCode }, relations: ['user'] });
    if (!order) throw new Error('Không tìm thấy đơn hàng');
    order.payment_status = PaymentStatus.Paid;
    order.productStatus = ProductStatus.Pending;

    // Send invoice email using the template
    await this.notificationsService.sendEmail(
      order.user.email,
      'Hóa đơn thanh toán từ Pengoo',
      `Cảm ơn bạn đã thanh toán. Vui lòng xem hóa đơn đính kèm.`,
      undefined,
      pengooEmailTemplate({
        title: 'Hóa đơn thanh toán',
        message: `Xin chào ${order.user.full_name || order.user.email},<br><br>
          Cảm ơn bạn đã thanh toán đơn hàng tại Pengoo.<br>
          Vui lòng xem hóa đơn đính kèm.<br><br>
          Nếu có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua hotline bên dưới.`,
        logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755175429/logopengoo_tjwzhh.png',
      })
    );

    await this.invoicesService.generateInvoice(order.id);
    return await this.ordersRepository.save(order);
  }

  async handleOrderCancellation(orderCode: number) {
    const order = await this.ordersRepository.findOne({ where: { order_code: orderCode } });
    if (!order) {
      return new NotFoundException('Không tìm thấy đơn hàng');
    }
    order.payment_status = PaymentStatus.Canceled;
    order.productStatus = ProductStatus.Cancelled;

    // Send cancellation email using the template
    await this.notificationsService.sendEmail(
      order.user.email,
      'Đơn hàng bị hủy do hết hàng',
      `Đơn hàng của bạn #${order.id} đã bị hủy vì chúng tôi không còn đủ hàng để giao. Vui lòng liên hệ với chúng tôi để được hỗ trợ hoặc hoàn tiền.`,
      undefined,
      pengooEmailTemplate({
        title: 'Đơn hàng bị hủy',
        message: `Đơn hàng của bạn <b>#${order.id}</b> đã bị hủy vì chúng tôi không còn đủ hàng để giao.<br>
        Vui lòng liên hệ với chúng tôi để được hỗ trợ hoặc hoàn tiền.<br>
        Xin lỗi vì sự bất tiện này.`,
        logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755175429/logopengoo_tjwzhh.png',
      })
    );

    return await this.ordersRepository.save(order);
  }
  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findById(id);
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
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
      if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

      for (const detail of order.details) {
        // Use detail.product.id instead of detail.productId
        const product = await this.productsService.findById(detail.product.id);
        if (product) {
          product.quantity_sold += detail.quantity;
          product.quantity_stock -= detail.quantity;
          // Save using a public method, not productsRepository directly
          await this.productsService.save(product);
        }
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

      if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

      // 1. Only allow refund for delivered orders
      if (order.productStatus !== ProductStatus.Delivered) {
        throw new BadRequestException('Chỉ có thể yêu cầu hoàn tiền cho đơn hàng đã giao.');
      }

      // 2. Check refund window (e.g., 14 days after delivery)
      const deliveredAt = order.order_date;
      const REFUND_WINDOW_DAYS = 14;
      const now = new Date();
      const deliveredDate = new Date(deliveredAt);
      if ((now.getTime() - deliveredDate.getTime()) > REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000) {
        throw new BadRequestException('Thời hạn hoàn tiền đã hết.');
      }

      // 3. Check if refund already exists and limit requests
      const previousRequests = order.refundRequests || [];
      const pendingRequest = previousRequests.find(r => r.status === RefundRequestStatus.PENDING);
      if (pendingRequest) {
        throw new BadRequestException('Đã có yêu cầu hoàn tiền đang chờ xử lý cho đơn đặt hàng này.');
      }
      if (previousRequests.length >= 3) {
        throw new BadRequestException('Bạn đã đạt đến số lượng yêu cầu hoàn tiền tối đa cho đơn đặt hàng này.');
      }

      // 4. Validate reason and evidence
      const dropdownReasons = ['defective', 'missing', 'wrong'];
      if (
        !data.reason ||
        (
          !dropdownReasons.includes(data.reason) &&
          data.reason.trim().length < 10
        )
      ) {
        throw new BadRequestException('Vui lòng cung cấp lý do chi tiết cho yêu cầu hoàn tiền của bạn (ít nhất 10 ký tự cho lý do tùy chỉnh).');
      }

      // 5. Allow partial refund (optional: here, full refund)
      let refundAmount = order.total_price;

      // 6. Prevent duplicate refund for already refunded orders
      if (order.payment_status === PaymentStatus.Refunded) {
        throw new BadRequestException('Đơn đặt hàng này đã được hoàn tiền.');
      }

      // 7. Create refund request
      const refundRequest = manager.create(RefundRequest, {
        order,
        reason: data.reason,
        user: { id: data.user_id },
        amount: order.total_price,
        toAccountNumber: data.toAccountNumber,
        toBin: data.toBin,
        bank: data.bank,
        paymentMethod: data.paymentMethod,
        times: (order.refundRequests?.length ?? 0) + 1,
        status: RefundRequestStatus.PENDING,
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

      if (adminEmails.length === 0) {
        adminEmails.push(this.configService.get<string>('ADMIN_EMAIL') || 'admin@pengoo.store');
      }

      // --- Vietnamese Admin Notification Email ---
      const subject = `Yêu cầu hoàn tiền #${refundRequest.id} vừa được tạo`;
      const message = pengooEmailTemplate({
        title: 'Thông báo yêu cầu hoàn tiền',
        message: `
          Một yêu cầu hoàn tiền mới vừa được tạo.<br>
          <b>Mã đơn hàng:</b> ${order.id}<br>
          <b>Người dùng:</b> ${order.user?.email || 'Không xác định'}<br>
          <b>Lý do:</b> ${refundRequest.reason}<br>
          <b>Số tiền:</b> ${refundRequest.amount.toLocaleString('vi-VN')} VND<br>
          <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}<br>
        `,
        logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755175429/logopengoo_tjwzhh.png',
      });

      for (const email of adminEmails) {
        await this.notificationsService.sendEmail(
          email,
          subject,
          `Một yêu cầu hoàn tiền mới vừa được tạo cho đơn hàng #${order.id}.`,
          undefined,
          message
        );
      }

      // --- Vietnamese Audit Log Email ---
      const auditLogSubject = `Nhật ký kiểm toán: Yêu cầu hoàn tiền #${refundRequest.id}`;
      const auditLogMessage = pengooEmailTemplate({
        title: 'Nhật ký kiểm toán hoàn tiền',
        message: `
          [AUDIT] Yêu cầu hoàn tiền vừa được tạo cho đơn hàng ${order.id} bởi người dùng ${data.user_id}<br>
          <b>Mã đơn hàng:</b> ${order.id}<br>
          <b>ID người dùng:</b> ${data.user_id}<br>
          <b>Email người dùng:</b> ${order.user?.email || 'Không xác định'}<br>
          <b>Lý do:</b> ${refundRequest.reason}<br>
          <b>Số tiền:</b> ${refundRequest.amount.toLocaleString('vi-VN')} VND<br>
          <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}<br>
        `,
        logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755175429/logopengoo_tjwzhh.png',
      });

      for (const email of adminEmails) {
        await this.notificationsService.sendEmail(
          email,
          auditLogSubject,
          `[AUDIT] Yêu cầu hoàn tiền vừa được tạo cho đơn hàng ${order.id} bởi người dùng ${data.user_id}`,
          undefined,
          auditLogMessage
        );
      }

      // Also log to console for local audit
      console.log(`[AUDIT] Yêu cầu hoàn tiền vừa được tạo cho đơn hàng ${order.id} bởi người dùng ${data.user_id}`);

      return refundRequest;
    });

    return {
      status: 200,
      message: 'Yêu cầu hoàn tiền đã được tạo thành công.',
      data: refundRequest,
      estimatedProcessingTime: '3-7 ngày làm việc',
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
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
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

  async updateRefundRequestStatus(id: number, status: string) {
    const refundRequestRepo = this.dataSource.getRepository(RefundRequest);
    const refundRequest = await refundRequestRepo.findOne({ where: { id }, relations: ['user', 'order'] });
    if (!refundRequest) throw new NotFoundException('Không tìm thấy yêu cầu hoàn tiền');
    refundRequest.status = status as RefundRequestStatus;
    await refundRequestRepo.save(refundRequest);

    // Send email to customer
    let subject = '';
    let message = '';
    if (status === 'APPROVED') {
      subject = 'Yêu cầu hoàn tiền đã được duyệt';
      message = `Yêu cầu hoàn tiền cho đơn hàng #${refundRequest.order.id} đã được duyệt. Số tiền sẽ được hoàn lại trong vòng 3-7 ngày làm việc.`;
    } else if (status === 'REJECTED') {
      subject = 'Yêu cầu hoàn tiền bị từ chối';
      message = `Yêu cầu hoàn tiền cho đơn hàng #${refundRequest.order.id} đã bị từ chối. Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi.`;
    }
    if (subject && refundRequest.user?.email) {
      await this.notificationsService.sendEmail(
        refundRequest.user.email,
        subject,
        message,
        undefined,
        pengooEmailTemplate({
          title: subject,
          message,
          logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755175429/logopengoo_tjwzhh.png',
        })
      );
    }

    return { status: 200, message: 'Đã cập nhật trạng thái yêu cầu hoàn tiền', data: refundRequest };
  }

  async processRefundRequest(id: number) {
    const refundRequestRepo = this.dataSource.getRepository(RefundRequest);
    const refundRequest = await refundRequestRepo.findOne({ where: { id }, relations: ['user', 'order'] });
    if (!refundRequest) throw new NotFoundException('Không tìm thấy yêu cầu hoàn tiền');
    refundRequest.status = RefundRequestStatus.REFUNDED;
    await refundRequestRepo.save(refundRequest);

    // Send email to customer
    if (refundRequest.user?.email) {
      await this.notificationsService.sendEmail(
        refundRequest.user.email,
        'Hoàn tiền đã được xử lý',
        `Yêu cầu hoàn tiền cho đơn hàng #${refundRequest.order.id} đã được xử lý. Số tiền sẽ sớm được chuyển vào tài khoản của bạn.`,
        undefined,
        pengooEmailTemplate({
          title: 'Hoàn tiền đã được xử lý',
          message: `Yêu cầu hoàn tiền cho đơn hàng #${refundRequest.order.id} đã được xử lý. Số tiền sẽ sớm được chuyển vào tài khoản của bạn.`,
          logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755175429/logopengoo_tjwzhh.png',
        })
      );
    }

    return { status: 200, message: 'Yêu cầu hoàn tiền được đánh dấu là đã hoàn lại', data: refundRequest };
  }
}
