import { Module } from '@nestjs/common';
import { InvoicesController } from './invoice.controller';
import { InvoicesService } from './invoice.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../orders/order.entity';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), NotificationsModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}