import { Injectable } from '@nestjs/common';
import { Order } from '../../orders/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import easyinvoice from 'easyinvoice';
import * as fs from 'fs';
import * as path from 'path';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private notificationsService: NotificationsService, // Inject this
  ) {}

  async generateInvoice(orderId: number): Promise<string> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'details', 'details.product'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const invoiceData = {
      documentTitle: 'Invoice',
      sender: {
        company: 'Pengoo Corpporation',
        address: '130/9 Dien Bien Phu Street, Binh Thanh District, Ho Chi Minh City',
        zip: '700000',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        phone: '0937314158',
      },
      client: {
        company: order.user.full_name,
        address: order.user.address || '',
        zip: '',
        city: '',
        country: '',
        email: order.user.email,
      },
      invoiceNumber: order.id.toString(),
      invoiceDate: order.order_date.toISOString().split('T')[0],
      products: order.details.map(detail => ({
        quantity: detail.quantity.toString(),
        description: detail.product.product_name,
        price: detail.price,
        tax: 0,
      })),
      // Add payment info to the invoice
      custom: [
        {
          title: "Payment Method",
          value: order.payment_type,
        },
        {
          title: "Payment Status",
          value: order.payment_status,
        }
      ],
      bottomNotice: 'Thank you for your purchase!',
    };

    const invoicesDir = path.join(process.cwd(), 'invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir);
    }

    const result = await easyinvoice.createInvoice(invoiceData);
    const invoicePath = path.join(invoicesDir, `invoice_${order.id}.pdf`);
    fs.writeFileSync(invoicePath, result.pdf, 'base64');

    // Send invoice PDF to user
    await this.notificationsService.sendEmail(
      order.user.email,
      'Your Invoice',
      'Thank you for your payment. Please find your invoice attached.',
      invoicePath // You may need to update sendEmail to handle attachments
    );

    return invoicePath;
  }
}
