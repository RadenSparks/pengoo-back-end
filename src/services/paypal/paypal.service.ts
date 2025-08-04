import { Injectable, NotFoundException } from '@nestjs/common';
import * as paypal from '@paypal/paypal-server-sdk';
import { OrdersService } from '../../orders/orders.service';
import { ConfigService } from '@nestjs/config';
import { InvoicesService } from '../invoices/invoice.service';

@Injectable()
export class PaypalService {
  private environment: paypal.core.SandboxEnvironment;
  private client: paypal.core.PayPalHttpClient;

  constructor(
    private ordersService: OrdersService,
    private configService: ConfigService,
    private invoicesService: InvoicesService,
  ) {
    this.environment = new paypal.core.SandboxEnvironment(
      this.configService.get<string>('PAYPAL_CLIENT_ID'),
      this.configService.get<string>('PAYPAL_CLIENT_SECRET')
    );
    this.client = new paypal.core.PayPalHttpClient(this.environment);
  }

  async createOrder(orderId: number) {
    const order = await this.ordersService.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'VND',
          value: order.total_price.toString(),
        },
      }],
      application_context: {
        return_url: `https://your-frontend-url.com/checkout/paypal-success?orderId=${orderId}`,
        cancel_url: `https://your-frontend-url.com/checkout/paypal-cancel?orderId=${orderId}`,
      }
    });

    const response = await this.client.execute(request);
    order.paypal_order_id = response.result.id;
    await this.ordersService.save(order);

    const approvalUrl = response.result.links.find(link => link.rel === 'approve')?.href;
    return { paypalOrderId: response.result.id, approvalUrl };
  }

  async captureOrder(paypalOrderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});
    const response = await this.client.execute(request);

    const order = await this.ordersService.findByPaypalOrderId(paypalOrderId);
    if (order) {
      order.payment_status = 'paid';
      await this.ordersService.save(order);

      // Generate and send invoice
      await this.invoicesService.generateInvoice(order.id);
    }

    return response.result;
  }
}
