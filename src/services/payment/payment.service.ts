import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, PaymentStatus } from '../../orders/order.entity';
import { PaymentMethod } from './payment.types';
import { PaypalService } from '../paypal/paypal.service';
import { PayosService } from '../payos/payos.service';
import { InvoicesService } from '../invoices/invoice.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private paypalService: PaypalService,
    private dataSource: DataSource,
    private payosService: PayosService,
    private invoicesService: InvoicesService,
  ) { }

  // Only allow order owner or admin
  private async assertCanAct(userId: number, order: Order, userRole: string) {
    if (order.user.id !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Bạn không được phép thực hiện hành động này theo lệnh này.');
    }
  }

  async pay(orderId: number, method: PaymentMethod, userId: number, userRole: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng');
    await this.assertCanAct(userId, order, userRole);

    if (order.payment_status === PaymentStatus.Paid) {
      throw new BadRequestException('Đơn hàng đã được thanh toán.');
    }
    if (order.payment_status === PaymentStatus.PendingOnDelivery && method === PaymentMethod.ON_DELIVERY) {
      throw new BadRequestException('Đơn đặt hàng đã được đặt để thanh toán khi giao hàng.');
    }
    if (order.productStatus === 'cancelled') {
      throw new BadRequestException('Không thể thanh toán cho đơn hàng bị hủy.');
    }

    switch (method) {
      case PaymentMethod.PAYPAL:
        // Set status to pending, create PayPal order, update to paid after capture
        order.payment_status = PaymentStatus.Pending;
        await this.ordersRepository.save(order);
        return this.paypalService.createOrder(orderId);
      case PaymentMethod.ON_DELIVERY:
        order.payment_status = PaymentStatus.PendingOnDelivery;
        await this.ordersRepository.save(order);
        return { message: 'Order placed. Pay on delivery.' };
      default:
        throw new BadRequestException('Phương thức thanh toán không được hỗ trợ');
    }
  }
  async handlePaypalCapture(orderId: number, userId: number, userRole: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng');
    await this.assertCanAct(userId, order, userRole);

    if (order.payment_status === PaymentStatus.Paid) {
      return { message: 'Order is already paid.' }; // <-- 200 OK
    }
    if (order.productStatus === 'cancelled') {
      throw new BadRequestException('Không thể thu hồi khoản thanh toán cho đơn hàng bị hủy.');
    }

    order.payment_status = PaymentStatus.Paid;
    await this.ordersRepository.save(order);

    // Send invoice email
    await this.invoicesService.generateInvoice(orderId);

    return { message: 'Payment captured, order marked as paid, and invoice sent.' };
  }

  async handlePayosCapture(orderId: number, userId: number, userRole: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng');
    await this.assertCanAct(userId, order, userRole);

    if (order.payment_status === PaymentStatus.Paid) {
      throw new BadRequestException('Đơn hàng đã được thanh toán.');
    }
    if (order.productStatus === 'cancelled') {
      throw new BadRequestException('Không thể thu hồi khoản thanh toán cho đơn hàng bị hủy.');
    }

    order.payment_status = PaymentStatus.Paid;
    await this.ordersRepository.save(order);

    // Generate and send invoice
    await this.invoicesService.generateInvoice(orderId);

    return { message: 'Khoản thanh toán Payos đã được ghi lại và hóa đơn đã được gửi.' };
  }

  async refundOrder(orderId: number, userId: number, userRole: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng');
    await this.assertCanAct(userId, order, userRole);

    if (order.payment_status !== PaymentStatus.Paid) {
      throw new BadRequestException('Đơn đặt hàng chưa được thanh toán hoặc đã được hoàn lại.');
    }
    if (order.productStatus === 'cancelled') {
      throw new BadRequestException('Đơn đặt hàng đã bị hủy.');
    }

    await this.dataSource.transaction(async manager => {
      // Refund via PayPal
      if (order.payment_type === PaymentMethod.PAYPAL) {
        await this.paypalService.refundOrder(order.id);
      }
      // Refund via PayOS
      if (order.payment_type === PaymentMethod.PAYOS) {
        await this.payosService.refundOrder(order.order_code);
      }
      order.payment_status = PaymentStatus.Refunded;
      order.productStatus = 'cancelled';
      await manager.save(order);
    });

    return { message: 'Order refunded and cancelled.' };
  }

  async cancelOrder(orderId: number, userId: number, userRole: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng');
    await this.assertCanAct(userId, order, userRole);

    if (order.productStatus === 'cancelled') {
      throw new BadRequestException('Đơn đặt hàng đã bị hủy.');
    }
    if (order.payment_status === PaymentStatus.Paid) {
      // Refund if paid
      await this.refundOrder(orderId, userId, userRole);
      return { message: 'Đơn hàng bị hủy và được hoàn tiền.' };
    }

    // If not paid, just cancel
    order.productStatus = 'cancelled';
    await this.ordersRepository.save(order);
    return { message: 'Order cancelled.' };
  }

  async markOrderAsPaid(orderId: number, userId: number, userRole: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng');
    await this.assertCanAct(userId, order, userRole);

    if (order.payment_status === PaymentStatus.Paid) {
      throw new BadRequestException('Đơn hàng đã được thanh toán.');
    }

    order.payment_status = PaymentStatus.Paid;
    await this.ordersRepository.save(order);

    // Send invoice email
    await this.invoicesService.generateInvoice(orderId);

    return { message: 'Đơn hàng được đánh dấu là đã thanh toán và đã gửi hóa đơn.' };
  }
}