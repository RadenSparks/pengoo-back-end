import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import fetch from 'node-fetch';
import { OrdersService } from '../../orders/orders.service';
import { ConfigService } from '@nestjs/config';
import { InvoicesService } from '../invoices/invoice.service';
import { PaymentStatus } from 'src/orders/order.entity';

@Injectable()
export class PaypalService {
  private clientId: string;
  private clientSecret: string;
  private apiBase: string;

  constructor(
    private ordersService: OrdersService,
    private configService: ConfigService,
    private invoicesService: InvoicesService,
  ) {
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID') ?? '';
    if (!this.clientId) {
      throw new Error('PAYPAL_CLIENT_ID is not defined in environment variables');
    }
    this.clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET') ?? '';
    if (!this.clientSecret) {
      throw new Error('PAYPAL_CLIENT_SECRET is not defined in environment variables');
    }
    this.apiBase = this.configService.get<string>('PAYPAL_API_BASE') || 'https://api-m.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const res = await fetch(`${this.apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) throw new InternalServerErrorException('Failed to get PayPal access token');
    const data = await res.json();
    return data.access_token;
  }

  async createOrder(orderId: number) {
    const order = await this.ordersService.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const accessToken = await this.getAccessToken();
    const body = {
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
    };

    const res = await fetch(`${this.apiBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new InternalServerErrorException('Failed to create PayPal order');
    const data = await res.json();

    order.paypal_order_id = data.id;
    await this.ordersService.save(order);

    const approvalUrl = data.links.find((link) => link.rel === 'approve')?.href;
    return { paypalOrderId: data.id, approvalUrl };
  }

  async captureOrder(paypalOrderId: string) {
    const accessToken = await this.getAccessToken();
    const res = await fetch(`${this.apiBase}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new InternalServerErrorException('Failed to capture PayPal order');
    const data = await res.json();

    const order = await this.ordersService.findByPaypalOrderId(paypalOrderId);
    if (order) {
      order.payment_status = PaymentStatus.Paid;
      await this.ordersService.save(order);
      await this.invoicesService.generateInvoice(order.id);
    }

    return data;
  }

  async refundOrder(orderId: number): Promise<any> {
    const order = await this.ordersService.findById(orderId);
    if (!order || !order.paypal_order_id) {
      throw new NotFoundException('Order or PayPal order ID not found');
    }
    const accessToken = await this.getAccessToken();

    // Fetch PayPal order details to get the capture ID
    const orderRes = await fetch(`${this.apiBase}/v2/checkout/orders/${order.paypal_order_id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!orderRes.ok) throw new InternalServerErrorException('Failed to fetch PayPal order details');
    const orderData = await orderRes.json();
    const captureId = orderData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    if (!captureId) throw new InternalServerErrorException('PayPal capture ID not found');

    // Refund API call
    const refundRes = await fetch(`${this.apiBase}/v2/payments/captures/${captureId}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    if (!refundRes.ok) throw new InternalServerErrorException('Failed to refund PayPal payment');
    const refundData = await refundRes.json();

    // Optionally update order status in your DB
    order.payment_status = PaymentStatus.Refunded;
    order.productStatus = 'cancelled';
    await this.ordersService.save(order);

    return refundData;
  }
}
