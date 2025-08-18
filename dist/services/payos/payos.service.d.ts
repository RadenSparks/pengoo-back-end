import { InvoicesService } from '../invoices/invoice.service';
export declare class PayosService {
    private invoicesService;
    private readonly apiUrl;
    private readonly apiKey;
    private readonly clientId;
    private readonly clientSecret;
    constructor(invoicesService: InvoicesService);
    createInvoice(data: {
        orderCode: number;
        amount: number;
        returnUrl: string;
        cancelUrl: string;
        description: string;
    }): Promise<any>;
    handlePayosPaymentSuccess(orderId: number): Promise<{
        message: string;
    }>;
    refundOrder(data: {
        orderCode: number;
        amount: number;
        toBin: string;
        toAccountNumber: string;
    }): Promise<any>;
    generateSignature(data: any): string;
}
