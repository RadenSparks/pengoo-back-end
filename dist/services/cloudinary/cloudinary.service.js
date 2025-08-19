"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const dotenv = require("dotenv");
dotenv.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
let CloudinaryService = class CloudinaryService {
    async uploadImage(file, purpose, options) {
        let folder = 'misc';
        let publicId = 'misc';
        if (purpose === 'product' && options?.slug) {
            folder = `products/${options.slug}`;
            publicId = options.isMain
                ? `main_${options.slug}`
                : options.detailIndex
                    ? `detail_${options.slug}_${options.detailIndex}`
                    : `other_${options.slug}_${Date.now()}`;
        }
        else if (purpose === 'user' && options?.userId) {
            folder = `users`;
            publicId = `avatar_${options.userId}`;
        }
        else if (purpose === 'refund' && options?.userId) {
            folder = `requests`;
            publicId = `refund_${options.userId}_${Date.now()}`;
        }
        return new Promise((resolve, reject) => {
            cloudinary_1.v2.uploader.upload_stream({ folder }, (error, result) => {
                if (error)
                    return reject(error);
                if (!result) {
                    throw new Error('Upload failed');
                }
                resolve({ secure_url: result.secure_url, public_id: result.public_id });
            }).end(file.buffer);
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)()
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map