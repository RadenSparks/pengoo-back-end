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
        private invoicesService: InvoicesService,
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
            const res = await axios.post(this.apiUrl, payload, {
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
        // Tạo hóa đơn và gửi email cho người dùng
        await this.invoicesService.generateInvoice(orderId);

        return { message: 'Hóa đơn đã được tạo và gửi cho khách hàng.' };
    }

    async refundOrder(orderCode: number): Promise<any> {
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
