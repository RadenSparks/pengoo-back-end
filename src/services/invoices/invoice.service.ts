import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { NotificationsService, pengooEmailTemplate } from '../../notifications/notifications.service';
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

    // Send email with invoice attached and styled HTML
    await this.notificationsService.sendEmail(
      order.user.email,
      'Pengoo - Your Invoice',
      `Thank you for your payment. Please find your invoice attached.`,
      invoicePath,
      pengooEmailTemplate({
        title: 'Your Invoice',
        message: `Dear ${order.user.full_name || order.user.email},<br><br>
          Thank you for your payment. Please find your invoice attached.<br><br>
          If you have any questions, contact us at the hotline below.`,
        logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755174794/logonav_ck9fwi.png', // <-- Use your actual logo URL here
      }),
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
      logo: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755174794/logonav_ck9fwi.png', // <-- Use your actual logo URL here
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
    // Use /tmp/invoices for serverless compatibility
    const invoiceDir = path.join('/tmp', 'invoices');
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

  async getOrderWithDetails(orderId: number): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'details', 'details.product'],
    });
  }

  canDownloadInvoice(order: Order): boolean {
    // Only allow download if paid (for COD, must be marked as paid)
    if (order.payment_type === 'cod' && order.payment_status !== 'paid') {
      return false;
    }
    if (order.payment_status !== 'paid') {
      return false;
    }
    return true;
  }
}
