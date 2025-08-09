import { InvoicesService } from './invoice.service';
import { Response } from 'express';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    getInvoice(orderId: string, res: Response): Promise<void>;
    resendInvoice(orderId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
