import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { InvoicesService } from '../invoices/invoice.service';

@Injectable()
export class PayosService {
    private readonly apiUrl = 'https://api-merchant.payos.vn/v2/payment-requests';
    private readonly apiKey = process.env.PAYOS_API_KEY;
    private readonly clientId = process.env.PAYOS_CLIENT_ID;
    private readonly clientSecret = process.env.PAYOS_CHECKSUM_KEY || "";

    constructor(
        private invoicesService: InvoicesService, // Inject the invoice service
    ) {}

    async createInvoice(data: {
        orderCode: number;
        amount: number;
        returnUrl: string;
        cancelUrl: string;
        description: string;
    }) {
        const { orderCode, amount, returnUrl, cancelUrl, description } = data;
        const rawData = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
        const signature = crypto
            .createHmac('sha256', this.clientSecret)
            .update(rawData)
            .digest('hex');
        const payload = {
            orderCode,
            amount,
            returnUrl,
            cancelUrl,
            description,
            signature,
        };

        try {
            // const agent = new https.Agent({
            //     rejectUnauthorized: false, // Bỏ verify SSL
            // });
            const res = await axios.post(this.apiUrl, payload, {
                // httpsAgent: agent,
                headers: {
                    'x-api-key': this.apiKey ?? '',
                    'x-client-id': this.clientId ?? '',
                    'Content-Type': 'application/json',
                },

            });
            return res.data;
        } catch (err: any) {
            throw new HttpException(err.response?.data || 'Lỗi khi gọi PayOS', err.response?.status || 500);
        }
    }

    async handlePayosPaymentSuccess(orderId: number) {
        // This will generate the invoice and send the email
        await this.invoicesService.generateInvoice(orderId);

        return { message: 'Invoice generated and sent to user.' };
    }

    async refundOrder(orderCode: number): Promise<any> {
        // Implement PayOS refund API call here
        // Example: POST to https://api-merchant.payos.vn/v2/payment-requests/{orderCode}/refund
        // You may need to check PayOS docs for the exact endpoint and payload
        try {
            const res = await axios.post(
                `https://api-merchant.payos.vn/v2/payment-requests/${orderCode}/refund`,
                {},
                {
                    headers: {
                        'x-api-key': this.apiKey ?? '',
                        'x-client-id': this.clientId ?? '',
                        'Content-Type': 'application/json',
                    },
                }
            );
            return res.data;
        } catch (err: any) {
            throw new HttpException(err.response?.data || 'Lỗi khi hoàn tiền PayOS', err.response?.status || 500);
        }
    }
}
