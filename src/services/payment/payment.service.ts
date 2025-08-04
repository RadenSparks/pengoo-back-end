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
  ) {}

  // Only allow order owner or admin
  private async assertCanAct(userId: number, order: Order, userRole: string) {
    if (order.user.id !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not allowed to perform this action on this order.');
    }
  }

  async pay(orderId: number, method: PaymentMethod, userId: number, userRole: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new BadRequestException('Order not found');
    await this.assertCanAct(userId, order, userRole);

    if (order.payment_status === PaymentStatus.Paid) {
      throw new BadRequestException('Order is already paid.');
    }
    if (order.payment_status === PaymentStatus.PendingOnDelivery && method === PaymentMethod.ON_DELIVERY) {
      throw new BadRequestException('Order is already set for on-delivery payment.');
    }
    if (order.productStatus === 'cancelled') {
      throw new BadRequestException('Cannot pay for a cancelled order.');
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
        throw new BadRequestException('Unsupported payment method');
    }
  }
  async handlePaypalCapture(orderId: number, userId: number, userRole: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new BadRequestException('Order not found');
    await this.assertCanAct(userId, order, userRole);

    if (order.payment_status === PaymentStatus.Paid) {
      throw new BadRequestException('Order is already paid.');
    }
    if (order.productStatus === 'cancelled') {
      throw new BadRequestException('Cannot capture payment for a cancelled order.');
    }

    order.payment_status = PaymentStatus.Paid;
    await this.ordersRepository.save(order);
    return { message: 'Payment captured and order marked as paid.' };
  }

  async handlePayosCapture(orderId: number, userId: number, userRole: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new BadRequestException('Order not found');
    await this.assertCanAct(userId, order, userRole);

    if (order.payment_status === PaymentStatus.Paid) {
      throw new BadRequestException('Order is already paid.');
    }
    if (order.productStatus === 'cancelled') {
      throw new BadRequestException('Cannot capture payment for a cancelled order.');
    }

    order.payment_status = PaymentStatus.Paid;
    await this.ordersRepository.save(order);

    // Generate and send invoice
    await this.invoicesService.generateInvoice(orderId);

    return { message: 'Payos payment captured and invoice sent.' };
  }

  async refundOrder(orderId: number, userId: number, userRole: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new BadRequestException('Order not found');
    await this.assertCanAct(userId, order, userRole);

    if (order.payment_status !== PaymentStatus.Paid) {
      throw new BadRequestException('Order is not paid or already refunded.');
    }
    if (order.productStatus === 'cancelled') {
      throw new BadRequestException('Order is already cancelled.');
    }

    // Transaction for refund and status update
    await this.dataSource.transaction(async manager => {
      // Refund via PayPal if needed (implement in PaypalService)
      if (order.payment_type === PaymentMethod.PAYPAL) {
        await this.paypalService.refundOrder(order.id);
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
    if (!order) throw new BadRequestException('Order not found');
    await this.assertCanAct(userId, order, userRole);

    if (order.productStatus === 'cancelled') {
      throw new BadRequestException('Order is already cancelled.');
    }
    if (order.payment_status === PaymentStatus.Paid) {
      // Optionally, auto-refund if paid
      return this.refundOrder(orderId, userId, userRole);
    }

    order.productStatus = 'cancelled';
    await this.ordersRepository.save(order);
    return { message: 'Order cancelled.' };
  }
}