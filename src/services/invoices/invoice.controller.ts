import { Controller, Get, Param, Res, NotFoundException, Post, ForbiddenException } from '@nestjs/common';
import { InvoicesService } from './invoice.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':orderId')
  async getInvoice(@Param('orderId') orderId: string, @Res() res: Response) {
    const order = await this.invoicesService.getOrderWithDetails(Number(orderId));
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (!this.invoicesService.canDownloadInvoice(order)) {
      throw new ForbiddenException('Invoice is only available after payment is confirmed.');
    }
    const invoicePath = await this.invoicesService.createInvoicePdf(order);
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
