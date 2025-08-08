import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotificationsService } from '../../notifications/notifications.service';
import { Order } from '../../orders/order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as easyinvoice from 'easyinvoice';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private notificationsService: NotificationsService,
  ) {}

  async generateInvoice(orderId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'details', 'details.product'],
    });
    if (!order) throw new InternalServerErrorException('Order not found');

    // Generate invoice PDF using easyInvoice
    const invoicePath = await this.createInvoicePdf(order);

    // Send email with invoice attached
    await this.notificationsService.sendEmail(
      order.user.email,
      'Pengoo - Your Invoice',
      `Dear ${order.user.full_name || order.user.email},

Thank you for your payment. Please find your invoice attached.

Pengoo Corporation
130/9 Dien Bien Phu Street, Binh Thanh District, Ho Chi Minh City
Hotline: 0937314158
`,
      invoicePath // Pass the file path as attachment
    );

    // Optionally, delete the PDF after sending
    fs.unlink(invoicePath, () => {});
  }

  async createInvoicePdf(order: Order): Promise<string> {
    const data = {
      documentTitle: 'INVOICE',
      currency: 'VND',
      taxNotation: 'vat',
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      logo: '',
      sender: {
        company: 'Pengoo Corporation',
        address: '130/9 Dien Bien Phu Street, Binh Thanh District',
        zip: '70000',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
      },
      client: {
        company: order.user.full_name || order.user.email,
        address: order.shipping_address,
        zip: '',
        city: '',
        country: '',
      },
      invoiceNumber: String(order.order_code),
      invoiceDate: new Date(order.order_date).toLocaleDateString('en-GB'),
      products: order.details.map((detail) => ({
        quantity: detail.quantity,
        description: detail.product?.product_name || 'Product',
        tax: 0,
        price: detail.product?.product_price || 0,
      })),
      bottomNotice: 'Thank you for your purchase!',
    };

    // Generate the invoice
    const result = await (easyinvoice as any).createInvoice(data);

    // Save PDF to disk
    const invoiceDir = path.join(process.cwd(), 'invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }
    const invoicePath = path.join(invoiceDir, `invoice-${order.id}.pdf`);
    fs.writeFileSync(invoicePath, result.pdf, 'base64');

    return invoicePath;
  }

  async createInvoicePdfByOrderId(orderId: number): Promise<string> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'details', 'details.product'],
    });
    if (!order) throw new InternalServerErrorException('Order not found');
    return this.createInvoicePdf(order);
  }
}
