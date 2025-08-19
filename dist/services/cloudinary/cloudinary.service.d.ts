export declare class CloudinaryService {
    uploadImage(file: Express.Multer.File, purpose?: 'product' | 'user' | 'refund', options?: {
        slug?: string;
        isMain?: boolean;
        detailIndex?: number;
        userId?: number;
    }): Promise<{
        secure_url: string;
        public_id: string;
    }>;
}
