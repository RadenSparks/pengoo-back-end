import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payment.service';
import { PaymentsController } from './payment.controller';
import { Order } from '../../orders/order.entity';
import { UsersModule } from '../../users/users.module';
import { PaypalService } from '../paypal/paypal.service';
import { OrdersModule } from '../../orders/orders.module';
import { InvoicesService } from '../invoices/invoice.service';
import { InvoicesModule } from '../invoices/invoices.module';
import { PayosModule } from '../payos/payos.module'; // <-- import here
import { NotificationsModule } from '../../notifications/notifications.module'; // <-- add this import

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    UsersModule,
    OrdersModule,
    InvoicesModule, // Add this
    PayosModule, // <-- add here
    NotificationsModule, // <-- add this line
  ],
  providers: [PaymentsService, PaypalService, InvoicesService], // Add InvoicesService
  controllers: [PaymentsController],
  exports: [PaymentsService, PaypalService],
})
export class PaymentModule {}