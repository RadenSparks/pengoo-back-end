import { Controller, Post, Param, Body } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { PaymentsService } from './payment.service';
import { PaymentMethod } from './payment.types';
import { Public } from '../../auth/public.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('pay/:orderId')
  @Public()
  @ApiBody({
    schema: {
      example: {
        method: 'paypal', // or 'on_delivery'
        userId: 1,
        userRole: 'USER'
      }
    }
  })
  async pay(
    @Param('orderId') orderId: number,
    @Body('method') method: PaymentMethod,
    @Body('userId') userId: number,
    @Body('userRole') userRole: string,
  ) {
    return this.paymentsService.pay(orderId, method, userId, userRole);
  }

  @Post('refund/:orderId')
  @Public()
  @ApiBody({
    schema: {
      example: {
        userId: 1,
        userRole: 'USER'
      }
    }
  })
  async refundOrder(
    @Param('orderId') orderId: number,
    @Body('userId') userId: number,
    @Body('userRole') userRole: string,
  ) {
    return this.paymentsService.refundOrder(orderId, userId, userRole);
  }

  @Post('cancel/:orderId')
  @Public()
  @ApiBody({
    schema: {
      example: {
        userId: 1,
        userRole: 'USER'
      }
    }
  })
  async cancelOrder(
    @Param('orderId') orderId: number,
    @Body('userId') userId: number,
    @Body('userRole') userRole: string,
  ) {
    return this.paymentsService.cancelOrder(orderId, userId, userRole);
  }

  @Post('paypal/capture/:orderId')
  @Public()
  @ApiBody({
    schema: {
      example: {
        userId: 1,
        userRole: 'USER'
      }
    }
  })
  async capturePaypal(
    @Param('orderId') orderId: number,
    @Body('userId') userId: number,
    @Body('userRole') userRole: string,
  ) {
    return this.paymentsService.handlePaypalCapture(orderId, userId, userRole);
  }
}