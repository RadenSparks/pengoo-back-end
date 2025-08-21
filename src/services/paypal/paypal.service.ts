import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { OrdersService } from '../../orders/orders.service';
import { ConfigService } from '@nestjs/config';
import { InvoicesService } from '../invoices/invoice.service';
import { PaymentStatus } from 'src/orders/order.entity';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PaypalService {
  private environment: paypal.core.LiveEnvironment | paypal.core.SandboxEnvironment;
  private client: paypal.core.PayPalHttpClient;

  constructor(
    private ordersService: OrdersService,
    private configService: ConfigService,
    private invoicesService: InvoicesService,
  ) {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const isLive = this.configService.get<string>('PAYPAL_API_BASE')?.includes('live') ?? false;

    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials are not set in environment variables');
    }

    this.environment = isLive
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);

    this.client = new paypal.core.PayPalHttpClient(this.environment);
  }

  async createOrder(orderId: number) {
    const order = await this.ordersService.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'VND',
            value: order.total_price.toString(),
          },
        },
      ],
      application_context: {
        return_url: `https://pengoo.store/checkout/paypal-success?orderId=${orderId}`,
        cancel_url: `https://pengoo.store/checkout/paypal-cancel?orderId=${orderId}`,
      },
    });

    try {
      const response = await this.client.execute(request);
      const paypalOrderId = response.result.id;
      order.paypal_order_id = paypalOrderId;
      await this.ordersService.save(order);

      const approvalUrl = response.result.links.find((link) => link.rel === 'approve')?.href;
      return { paypalOrderId, approvalUrl };
    } catch (err) {
      throw new InternalServerErrorException('Failed to create PayPal order');
    }
  }

  async captureOrder(paypalOrderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    try {
      const response = await this.client.execute(request);
      const order = await this.ordersService.findByPaypalOrderId(paypalOrderId);
      if (order) {
        order.payment_status = PaymentStatus.Paid;
        await this.ordersService.save(order);
        await this.invoicesService.generateInvoice(order.id);
      }
      return response.result;
    } catch (err) {
      throw new InternalServerErrorException('Failed to capture PayPal order');
    }
  }

  async refundOrder(orderId: number): Promise<any> {
    const order = await this.ordersService.findById(orderId);
    if (!order || !order.paypal_order_id) {
      throw new NotFoundException('Order or PayPal order ID not found');
    }

    // Get the capture ID from the PayPal order
    const getOrderRequest = new paypal.orders.OrdersGetRequest(order.paypal_order_id);
    let captureId: string | undefined;
    try {
      const orderRes = await this.client.execute(getOrderRequest);
      captureId = orderRes.result.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    } catch {
      throw new InternalServerErrorException('Failed to fetch PayPal order details');
    }
    if (!captureId) throw new InternalServerErrorException('PayPal capture ID not found');

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
      throw new InternalServerErrorException('Failed to refund PayPal payment');
    }
  }
}
