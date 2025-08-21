import { Module } from '@nestjs/common';
import { PaypalController } from './paypal.controller';
import { PaypalService } from './paypal.service';
import { OrdersModule } from '../../orders/orders.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [OrdersModule, InvoicesModule, ConfigModule],
  controllers: [PaypalController],
  providers: [PaypalService],
  exports: [PaypalService],
})
export class PaypalModule {}