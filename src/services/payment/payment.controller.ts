import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { PaymentsService } from './payment.service';
import { PaymentMethod } from './payment.types';
import { Public } from '../../auth/public.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('pay/:orderId')
  @Public()
  @ApiBody({
    schema: {
      example: {
        method: 'paypal', // or 'on_delivery'
        userId: 1,
        userRole: 'user'
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
        userRole: 'user'
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
        userRole: 'user'
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
        userRole: 'user'
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

  @Post('mark-paid/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    schema: {
      example: {
        userId: 1,
        userRole: 'admin'
      }
    }
  })
  async markOrderAsPaid(
    @Param('orderId') orderId: number,
    @Body('userId') userId: number,
    @Body('userRole') userRole: string,
  ) {
    return this.paymentsService.markOrderAsPaid(orderId, userId, userRole);
  }
}