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
  async uploadImage(
    file: Express.Multer.File,
    purpose?: 'product' | 'user' | 'refund',
    options?: { slug?: string; isMain?: boolean; detailIndex?: number; userId?: number }
  ): Promise<{ secure_url: string; public_id: string }> {
    let folder = 'misc';
    let publicId = 'misc';

    if (purpose === 'product' && options?.slug) {
      folder = `products/${options.slug}`;
      publicId = options.isMain
        ? `main_${options.slug}`
        : options.detailIndex
        ? `detail_${options.slug}_${options.detailIndex}`
        : `other_${options.slug}_${Date.now()}`;
    } else if (purpose === 'user' && options?.userId) {
      folder = `users`;
      publicId = `avatar_${options.userId}`;
    } else if (purpose === 'refund' && options?.userId) {
      folder = `requests`;
      publicId = `refund_${options.userId}_${Date.now()}`;
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          if (!result) {
            throw new Error('Upload failed');
          }
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        }
      ).end(file.buffer);
    });
  }
}
