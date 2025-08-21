import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payment.service';
import { PaymentsController } from './payment.controller';
import { Order } from '../../orders/order.entity';
import { UsersModule } from '../../users/users.module';
import { OrdersModule } from '../../orders/orders.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { PayosModule } from '../payos/payos.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { PaypalModule } from '../paypal/paypal.module'; // <-- Add this

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    UsersModule,
    OrdersModule,
    InvoicesModule,
    PayosModule,
    NotificationsModule,
    PaypalModule, // <-- Add this
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentModule {}