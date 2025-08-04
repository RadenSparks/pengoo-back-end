import { Module } from '@nestjs/common';
import { PayosService } from './payos.service';
import { InvoicesModule } from '../invoices/invoices.module'; // <-- import this

@Module({
  imports: [InvoicesModule], // <-- add this
  providers: [PayosService],
  exports: [PayosService],
})
export class PayosModule {}
