// src/services/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class CloudinaryService {
    /**
     * Uploads an image to Cloudinary, assigning it to a dynamic folder.
     * @param file The image file (Express.Multer.File)
     * @param folderName The folder to upload to (e.g. product slug)
     */
    async uploadImage(file: Express.Multer.File, folderName: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: `products/${folderName}` }, // Use dynamic folder
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) {
                        throw new Error('Upload failed');
                    }
                    resolve(result);
                }
            ).end(file.buffer);
        });
    }
}
