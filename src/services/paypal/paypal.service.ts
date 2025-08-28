import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { OrdersService } from '../../orders/orders.service';
import { ConfigService } from '@nestjs/config';
import { InvoicesService } from '../invoices/invoice.service';
import { PaymentStatus } from 'src/orders/order.entity';
import * as paypal from '@paypal/checkout-server-sdk';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class PaypalService {
  private environment: paypal.core.LiveEnvironment | paypal.core.SandboxEnvironment;
  private client: paypal.core.PayPalHttpClient;

  constructor(
    private ordersService: OrdersService,
    private configService: ConfigService,
    private invoicesService: InvoicesService,
    private notificationsService: NotificationsService,
  ) {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const apiBase = this.configService.get<string>('PAYPAL_API_BASE');
    const isLive = apiBase?.includes('paypal.com') && !apiBase?.includes('sandbox');

    this.environment = isLive
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);

    this.client = new paypal.core.PayPalHttpClient(this.environment);
  }

  async createOrder(orderId: number) {
    const order = await this.ordersService.findById(orderId);
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    // Convert VND to USD for PayPal
    const usdAmount = convertVndToUsd(order.total_price);

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: usdAmount.toString(),
          },
        },
      ],
      application_context: {
        return_url: `http://localhost:3001/checkout/paypal-success?order_id=${orderId}`,
        cancel_url: `http://localhost:3001/checkout/paypal-cancel?order_id=${orderId}`,
      },
    });

    try {
      const response = await this.client.execute(request);
      const paypalOrderId = response.result.id;
      console.log(`[PayPal] Created PayPal order: ${paypalOrderId} for order ${order.id}`);
      order.paypal_order_id = paypalOrderId;
      await this.ordersService.save(order);
      console.log(`[PayPal] Saved PayPal order ID ${paypalOrderId} to order ${order.id}`);

      const approvalUrl = response.result.links.find((link) => link.rel === 'approve')?.href;
      return { paypalOrderId, approvalUrl };
    } catch (err) {
      console.error('[PayPal] Failed to create PayPal order:', err?.message, err?.response?.data || err);
      throw new InternalServerErrorException('Không tạo được đơn hàng PayPal');
    }
  }

  async captureOrder(paypalOrderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    try {
      const response = await this.client.execute(request);
      console.log(`[PayPal] Capture response for ${paypalOrderId}:`, JSON.stringify(response.result, null, 2));
      const order = await this.ordersService.findByPaypalOrderId(paypalOrderId);
      console.log(`[PayPal] Lookup order by PayPal order ID ${paypalOrderId}:`, order ? `Found order ${order.id}` : 'Not found');
      if (order) {
        if (order.payment_status !== PaymentStatus.Paid) {
          order.payment_status = PaymentStatus.Paid;
          await this.ordersService.save(order);
          console.log(`[PayPal] Marked order ${order.id} as paid.`);

          await this.invoicesService.generateInvoice(order.id);
          await this.notificationsService.sendOrderConfirmation(order.user.email, order.id);
          console.log(`[PayPal] Sent invoice and confirmation for order ${order.id}.`);
        } else {
          console.log(`[PayPal] Order ${order.id} already marked as paid.`);
        }
      } else {
        console.warn(`[PayPal] No order found for PayPal order ID ${paypalOrderId}.`);
      }
      return response.result;
    } catch (err) {
      console.error('[PayPal] Failed to capture PayPal order:', err?.message, err?.response?.data || err);
      throw new InternalServerErrorException('Không tạo được đơn hàng PayPal');
    }
  }

  async refundOrder(orderId: number): Promise<any> {
    const order = await this.ordersService.findById(orderId);
    if (!order || !order.paypal_order_id) {
      throw new NotFoundException('Không tìm thấy đơn hàng hoặc ID đơn hàng PayPal');
    }

    // Get the capture ID from the PayPal order
    const getOrderRequest = new paypal.orders.OrdersGetRequest(order.paypal_order_id);
    let captureId: string | undefined;
    try {
      const orderRes = await this.client.execute(getOrderRequest);
      captureId = orderRes.result.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    } catch {
      throw new InternalServerErrorException('Không tìm nạp được chi tiết đơn hàng PayPal');
    }
    if (!captureId) throw new InternalServerErrorException('Không tìm thấy ID chụp PayPal');

    // Refund the capture
    const refundRequest = new paypal.payments.CapturesRefundRequest(captureId);
    refundRequest.requestBody({});
    try {
      const refundRes = await this.client.execute(refundRequest);
      order.payment_status = PaymentStatus.Refunded;
      order.productStatus = 'cancelled';
      await this.ordersService.save(order);
      return refundRes.result;
    } catch {
      throw new InternalServerErrorException('Không thể hoàn trả khoản thanh toán PayPal');
    }
  }
}

function convertVndToUsd(vnd: number, rate = 25000): number {
  return +(vnd / rate).toFixed(2);
}
