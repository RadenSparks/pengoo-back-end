import { ConfigService } from '@nestjs/config';
export declare class NotificationsService {
    private configService;
    private transporter;
    private from;
    constructor(configService: ConfigService);
    sendEmail(to: string, subject: string, message: string, attachmentPath?: string): Promise<void>;
    sendOrderConfirmation(email: string, orderId: number): Promise<void>;
    sendShippingUpdate(email: string, orderId: number, status: string): Promise<void>;
    sendPasswordReset(email: string, token: string): Promise<void>;
}
