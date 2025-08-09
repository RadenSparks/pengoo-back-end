import { Controller, Get, Param, Res, NotFoundException, Post } from '@nestjs/common';
import { InvoicesService } from './invoice.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':orderId')
  async getInvoice(@Param('orderId') orderId: string, @Res() res: Response) {
    const invoicePath = await this.invoicesService.createInvoicePdfByOrderId(Number(orderId));
    if (!fs.existsSync(invoicePath)) {
      throw new NotFoundException('Invoice not found');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);
    return res.sendFile(path.resolve(invoicePath));
  }

  @Post(':orderId/resend')
  async resendInvoice(@Param('orderId') orderId: string) {
    await this.invoicesService.generateInvoice(Number(orderId));
    return { success: true, message: 'Invoice resent successfully' };
  }
}
