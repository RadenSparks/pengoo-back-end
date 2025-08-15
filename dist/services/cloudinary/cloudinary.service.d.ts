import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
export declare class CloudinaryService {
    uploadImage(file: Express.Multer.File, folderName: string): Promise<UploadApiResponse | UploadApiErrorResponse>;
}
