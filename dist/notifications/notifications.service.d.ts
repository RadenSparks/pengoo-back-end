import { ConfigService } from '@nestjs/config';
export declare class NotificationsService {
    private configService;
    constructor(configService: ConfigService);
    sendEmail(to: string, subject: string, text: string, attachmentPath?: string, html?: string): Promise<void>;
    sendOrderConfirmation(email: string, orderId: number): Promise<void>;
    sendShippingUpdate(email: string, orderId: number, status: string): Promise<void>;
    sendPasswordReset(email: string, token: string): Promise<void>;
}
export declare function pengooEmailTemplate({ title, message, code, logoUrl, }: {
    title: string;
    message: string;
    code?: string;
    logoUrl?: string;
}): string;
