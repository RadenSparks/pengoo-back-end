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
    const originalTotal = order.details.reduce(
      (sum, detail) => sum + (detail.product?.product_price || 0) * detail.quantity,
      0,
    );
    const paidTotal = order.details.reduce(
      (sum, detail) => sum + Number(detail.price) * detail.quantity,
      0,
    );
    const discountAmount = originalTotal - order.total_price;
    const couponCode = order.coupon_code || '';

    const data = {
      documentTitle: 'HÓA ĐƠN',
      currency: 'VND',
      taxNotation: 'vat',
      marginTop: 30,
      marginRight: 30,
      marginLeft: 30,
      marginBottom: 30,
      logo: 'https://res.cloudinary.com/do6lj4onq/image/upload/v1755174794/logonav_ck9fwi.png', // Make sure this URL is accessible
      backgroundColor: '#f4f6fb',
      headerBackground: '#6341df',
      headerTextColor: '#fff',
      tableHeaderBackgroundColor: '#ffd700',
      tableHeaderTextColor: '#222',
      tableRowBackgroundColor: '#fff',
      tableRowAlternateBackgroundColor: '#f4f6fb',
      fontSize: 13,
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
        price: Number(detail.price),
      })),
      customFields: [
        {
          name: 'Tóm tắt thanh toán',
          value: `
            <table style="width:100%;font-size:13px;">
              <tr>
                <td style="padding:4px 0;">Tổng giá trị sản phẩm:</td>
                <td style="text-align:right;padding:4px 0;">${originalTotal.toLocaleString('vi-VN')} VND</td>
              </tr>
              ${couponCode ? `
              <tr>
                <td style="padding:4px 0;">Mã giảm giá sử dụng:</td>
                <td style="text-align:right;padding:4px 0;"><b>${couponCode}</b></td>
              </tr>
              ` : ''}
              ${discountAmount > 0 ? `
              <tr>
                <td style="padding:4px 0;">Số tiền giảm giá:</td>
                <td style="text-align:right;padding:4px 0;color:#6341df;"><b>${discountAmount.toLocaleString('vi-VN')} VND</b></td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding:4px 0;font-weight:bold;">Tổng thanh toán:</td>
                <td style="text-align:right;padding:4px 0;font-weight:bold;color:#ffd700;">${order.total_price.toLocaleString('vi-VN')} VND</td>
              </tr>
            </table>
          `,
        },
      ],
      bottomNotice: `
        <div style="font-size:16px;color:#6341df;font-weight:bold;margin-bottom:8px;">
          Cảm ơn bạn đã mua hàng tại Pengoo!
        </div>
        <div style="font-size:13px;color:#222;">
          Nếu có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi qua hotline: <b>0937 314 158</b>
        </div>
        <div style="margin-top:18px;">
          <span style="background:#ffd700;color:#222;padding:6px 18px;border-radius:8px;font-weight:600;">
            Địa chỉ cửa hàng: 130/9 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh
          </span>
        </div>
        <div style="margin-top:12px;font-size:12px;color:#888;">
          © ${new Date().getFullYear()} Pengoo Corporation. Mọi quyền được bảo lưu.
        </div>
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
