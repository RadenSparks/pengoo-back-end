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
        // Generate invoice PDF and get file path
        const invoicePath = await this.invoicesService.generateInvoice(orderId);

        // Fetch order and user info for email customization
        const order = await this.invoicesService['ordersRepository'].findOne({
            where: { id: orderId },
            relations: ['user', 'details', 'details.product'],
        });
        if (!order || !order.user) throw new Error('Order or user not found');

        // Build order items info
        const itemsInfo = order.details.map(detail => 
            `- ${detail.product?.product_name ?? 'Unknown'} x${detail.quantity} (${detail.price} VND each)`
        ).join('\n');

        const subject = 'Pengoo - Your Payment Invoice';
        const message = `
            Hello ${order.user.full_name || order.user.email},

            Thank you for your payment via PayOS. Please find your invoice attached.

            Order Code: ${order.id}
            Amount Paid: ${order.total_price} VND

            Items:
            ${itemsInfo}

            If you have any questions, please contact our support team.

            Best regards,
            Pengoo Team
        `;

        // Send the invoice email (assuming sendEmail supports attachments)
        await this.invoicesService['notificationsService'].sendEmail(
            order.user.email,
            subject,
            message,
            invoicePath // If your sendEmail supports attachments
        );

        return { message: 'Invoice generated and sent to user.' };
    }
}
