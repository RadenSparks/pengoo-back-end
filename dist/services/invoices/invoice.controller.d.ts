import { InvoicesService } from './invoice.service';
import { Response } from 'express';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    getInvoice(orderId: number, res: Response): Promise<void>;
    resendInvoice(orderId: number): Promise<{
        message: string;
    }>;
}
