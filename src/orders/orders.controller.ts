import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './update-orders-status.dto';
import { CreateOrderDto } from './create-orders.dto';


@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAllOrders() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOrderById(@Param('id') id: number) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  updateOrderStatus(@Param('id') id: number, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }

  @Delete(':id')
  removeOrder(@Param('id') id: number) {
    return this.ordersService.remove(id);
  }
}
