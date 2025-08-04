import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../orders/order.entity';
import { InvoicesService } from './invoice.service';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    NotificationsModule,
  ],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}