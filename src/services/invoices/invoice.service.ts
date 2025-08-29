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
    if (!order) throw new InternalServerErrorException('Không tìm thấy đơn hàng');

    // Generate invoice PDF using easyInvoice
    const invoicePath = await this.createInvoicePdf(order);

    // Send email with invoice attached and styled HTML
    await this.notificationsService.sendEmail(
      order.user.email,
      'Pengoo - Hóa đơn thanh toán',
      `Cảm ơn bạn đã thanh toán. Vui lòng xem hóa đơn đính kèm.`,
      invoicePath,
      pengooEmailTemplate({
        title: 'Hóa đơn thanh toán',
        message: `Xin chào ${order.user.full_name || order.user.email},<br><br>
          Cảm ơn bạn đã thanh toán đơn hàng tại Pengoo.<br>
          Vui lòng xem hóa đơn đính kèm.<br><br>
          Nếu có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua hotline bên dưới.`,
        logoUrl: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755175429/logopengoo_tjwzhh.png',
      }),
    );

    // Optionally, delete the PDF after sending
    fs.unlink(invoicePath, () => {});
  }

  async createInvoicePdf(order: Order): Promise<string> {
    // Calculate original total (sum of original product prices)
    const originalTotal = order.details.reduce(
      (sum, detail) => sum + (detail.product?.product_price || 0) * detail.quantity,
      0,
    );

    // Calculate actual paid total (sum of order detail prices)
    const paidTotal = order.details.reduce(
      (sum, detail) => sum + Number(detail.price) * detail.quantity,
      0,
    );

    // Calculate discount amount
    const discountAmount = originalTotal - order.total_price;

    // Coupon code
    const couponCode = order.coupon_code || '';

    const data = {
      documentTitle: 'HÓA ĐƠN',
      currency: 'VND',
      taxNotation: 'vat',
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      logo: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755175429/logopengoo_tjwzhh.png',
      sender: {
        company: 'Công ty Pengoo',
        address: '130/9 Điện Biên Phủ, Quận Bình Thạnh',
        zip: '70000',
        city: 'TP. Hồ Chí Minh',
        country: 'Việt Nam',
      },
      client: {
        company: order.user.full_name || order.user.email,
        address: order.shipping_address,
        zip: '',
        city: '',
        country: '',
      },
      invoiceNumber: String(order.order_code),
      invoiceDate: new Date(order.order_date).toLocaleDateString('vi-VN'),
      products: order.details.map((detail) => ({
        quantity: detail.quantity,
        description: detail.product?.product_name || 'Sản phẩm',
        tax: 0,
        price: Number(detail.price), // Price at time of order
      })),
      bottomNotice: `
        Cảm ơn bạn đã mua hàng tại Pengoo!<br>
        ${couponCode ? `Mã giảm giá sử dụng: <b>${couponCode}</b><br>` : ''}
        ${discountAmount > 0 ? `Số tiền giảm giá: <b>${discountAmount.toLocaleString('vi-VN')} VND</b><br>` : ''}
        Tổng thanh toán: <b>${order.total_price.toLocaleString('vi-VN')} VND</b>
      `,
    };

    // Generate the invoice
    const result = await (easyinvoice as any).createInvoice(data);

    // Save PDF to disk
    const invoiceDir = path.join('/tmp', 'invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }
    const invoicePath = path.join(invoiceDir, `hoa-don-${order.id}.pdf`);
    fs.writeFileSync(invoicePath, result.pdf, 'base64');

    return invoicePath;
  }

  async createInvoicePdfByOrderId(orderId: number): Promise<string> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'details', 'details.product'],
    });
    if (!order) throw new InternalServerErrorException('Không tìm thấy đơn hàng');
    return this.createInvoicePdf(order);
  }

  async getOrderWithDetails(orderId: number): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'details', 'details.product'],
    });
  }

  canDownloadInvoice(order: Order): boolean {
    // Chỉ cho phép tải hóa đơn nếu đã thanh toán (COD phải được đánh dấu là đã thanh toán)
    if (order.payment_type === 'cod' && order.payment_status !== 'paid') {
      return false;
    }
    if (order.payment_status !== 'paid') {
      return false;
    }
    return true;
  }
}
