import { Controller, Post, Param } from '@nestjs/common';
import { PaypalService } from './paypal.service';

@Controller('payments/paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Post('create-order/:orderId')
  async createPaypalOrder(@Param('orderId') orderId: number) {
    return this.paypalService.createOrder(orderId);
  }

  @Post('capture-order/:paypalOrderId')
  async capturePaypalOrder(@Param('paypalOrderId') paypalOrderId: string) {
    return this.paypalService.captureOrder(paypalOrderId);
  }
}
