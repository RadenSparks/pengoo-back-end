import { Controller, Get, Param, Res } from '@nestjs/common';
import { InvoicesService } from './invoice.service';
import { Response } from 'express';
import * as path from 'path';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':orderId')
  async getInvoice(@Param('orderId') orderId: number, @Res() res: Response) {
    const invoicePath: string = await this.invoicesService.createInvoicePdfByOrderId(orderId);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(path.resolve(invoicePath));
  }
}
