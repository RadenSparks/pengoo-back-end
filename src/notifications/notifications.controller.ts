import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Public } from '../auth/public.decorator'; // Add this import

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post('send-email')
  @Public()
  @ApiBody({
    schema: {
      example: {
        to: 'recipient@example.com',
        subject: 'Test Email',
        message: 'This is a test email sent from the API.',
      },
    },
  })
  async sendEmail(
    @Body() body: { to: string; subject: string; message: string },
  ) {
    if (!body.to || !body.subject || !body.message) {
      throw new BadRequestException('Thiếu các trường bắt buộc: đến, chủ đề, tin nhắn');
    }
    await this.notificationsService.sendEmail(body.to, body.subject, body.message);
    return { message: 'Email sent.' };
  }

  @Post('order-confirmation')
  @Public()
  @ApiBody({
    schema: {
      example: {
        email: 'customer@example.com',
        orderId: 1234,
      },
    },
  })
  async sendOrderConfirmation(
    @Body() body: { email: string; orderId: number },
  ) {
    if (!body.email || !body.orderId) {
      throw new BadRequestException('Thiếu các trường bắt buộc: email, orderId');
    }
    await this.notificationsService.sendOrderConfirmation(body.email, body.orderId);
    return { message: 'Order confirmation email sent.' };
  }

  @Post('shipping-update')
  @Public()
  @ApiBody({
    schema: {
      example: {
        email: 'customer@example.com',
        orderId: 1234,
        status: 'shipped',
      },
    },
  })
  async sendShippingUpdate(
    @Body() body: { email: string; orderId: number; status: string },
  ) {
    if (!body.email || !body.orderId || !body.status) {
      throw new BadRequestException('Thiếu các trường bắt buộc: email, orderId, trạng thái');
    }
    await this.notificationsService.sendShippingUpdate(body.email, body.orderId, body.status);
    return { message: 'Đã gửi email cập nhật vận chuyển.' };
  }

  @Post('password-reset')
  @Public()
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        token: 'reset-token-from-email',
      },
    },
  })
  async sendPasswordReset(
    @Body() body: { email: string; token: string },
  ) {
    if (!body.email || !body.token) {
      throw new BadRequestException('Thiếu các trường bắt buộc: email, token');
    }
    await this.notificationsService.sendPasswordReset(body.email, body.token);
    return {
      message: 'Đã gửi email đặt lại mật khẩu.'
    };
  }
}
