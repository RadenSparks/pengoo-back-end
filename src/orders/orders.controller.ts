import { Controller, Get, Post, Body, Param, Patch, Delete, Query, Res, BadRequestException, Put, UseGuards } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './update-orders-status.dto';
import { CreateOrderDto, CreateRefundRequestDto } from './create-orders.dto';
import { Response } from 'express';
import { Public } from '../auth/public.decorator';
import { JwtGuard } from 'src/auth/jwt/jwt.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/roles/role.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadedFiles, UseInterceptors } from '@nestjs/common';
import { RefundRequest } from './refund-request.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @Public()
  @ApiBody({
    type: CreateOrderDto,
    examples: {
      default: {
        summary: 'Create a new order',
        value: {
          userId: 1,
          delivery_id: 2,
          payment_type: 'paypal',
          total_price: 100,
          shipping_address: '123 Main St, City, Country',
          payment_status: 'pending',
          productStatus: 'pending',
          couponCode: 'SUMMER2024',
          details: [
            {
              productId: 10,
              quantity: 2,
              price: 30
            },
            {
              productId: 12,
              quantity: 1,
              price: 40
            }
          ]
        }
      }
    }
  })
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Patch(':id/status')
  @Public()
  @ApiBody({
    type: UpdateOrderStatusDto,
    examples: {
      default: {
        summary: 'Update order status',
        value: {
          productStatus: 'shipped'
        }
      }
    }
  })
  updateOrderStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Order ID must be an integer');
    }
    return this.ordersService.updateStatus(parsedId, updateOrderStatusDto);
  }

  @Get()
  @Public()
  findAllOrders() {
    return this.ordersService.findAll();
  }

  @Get('/delivery')
  @Public()
  getDelivery() {
    return this.ordersService.getDelivery();
  }

  @Get(':id')
  @Public()
  findOrderById(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Order ID must be an integer');
    }
    return this.ordersService.findById(parsedId);
  }

  @Get('order-code/:order_code')
  @Public()
  findOrderByOrderCode(@Param('order_code') order_code: string) {
    return this.ordersService.findByOrderCode(+(order_code));
  }

  @Post('payos/order-success')
  async handleOrderSuccess(@Query() query: any) {
    const { orderCode } = query;
    return await this.ordersService.markOrderAsPaidByCode(+orderCode);
  }

  @Post('payos/order-cancel')
  async handleOrderCancel(@Query() query: any) {
    const { orderCode } = query;
    const data = await this.ordersService.handleOrderCancellation(+orderCode);
    console.log(data)
    return data
  }

  @Delete(':id')
  @Public()
  removeOrder(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Order ID must be an integer');
    }
    return this.ordersService.remove(parsedId);
  }

  @Put(':id/restore')
  async restore(@Param('id') id: number) {
    await this.ordersService.restore(id);
    return { message: 'Order restored successfully.' };
  }

  // Updated refund request endpoint with improved logic
  @UseGuards(JwtAuthGuard)
  @Post('refund-request')
  @UseInterceptors(FilesInterceptor('files'))
  async createRefundRequest(
    @Body() body: CreateRefundRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // The service now handles:
    // - Only delivered orders
    // - Refund window (14 days)
    // - Max 3 requests, only one pending
    // - Reason length and evidence required
    // - Duplicate refund prevention
    // - Audit and notification logging
    return await this.ordersService.createRefundRequest(body, files);
  }

  @Post('cancel-oversold')
  async cancelOversoldOrders() {
    return await this.ordersService.cancelOversoldOrders();
  }
  @Patch(':id/address')
  @Public()
  updateOrderAddress(
    @Param('id') id: string,
    @Body() body: { shipping_address: string, phone_number: string }
  ) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Order ID must be an integer');
    }
    return this.ordersService.updateAddress(parsedId, body.shipping_address, body.phone_number);
  }

  @Get('refund-requests')
  @Public()
  async getRefundRequests() {
    try {
      return await this.ordersService.getRefundRequests();
    } catch (err) {
      console.error('Error fetching refund requests:', err?.message, err?.stack);
      throw new BadRequestException('Could not fetch refund requests');
    }
  }
}
