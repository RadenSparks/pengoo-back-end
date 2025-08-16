import { Controller, Get, Post, Body, Param, Patch, Delete, Query, Res, BadRequestException } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './update-orders-status.dto';
import { CreateOrderDto } from './create-orders.dto';
import { Response } from 'express';
import { Public } from '../auth/public.decorator'; // Add this import
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
    return await this.ordersService.markOrderAsPaidByCode(+orderCode); // sets status to 'paid'


  }

  @Post('payos/order-cancel')
  async handleOrderCancel(@Query() query: any) {
    const { orderCode } = query;
    const data = await this.ordersService.handleOrderCancellation(+orderCode);
    console.log(data)
    return data
    // return res.redirect(`https://pengoo.store/order/cancel?orderCode=${orderCode}`);
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

}
