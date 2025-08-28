"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const image_entity_1 = require("../images/entities/image.entity");
const cloudinary_1 = require("cloudinary");
let ImagesService = class ImagesService {
    imageRepo;
    constructor(imageRepo) {
        this.imageRepo = imageRepo;
    }
    async create(createImageDto) {
        const image = this.imageRepo.create(createImageDto);
        return this.imageRepo.save(image);
    }
    async findAll() {
        return this.imageRepo.find({ relations: ['product'] });
    }
    async findOne(id) {
        const image = await this.imageRepo.findOne({ where: { id }, relations: ['product'] });
        if (!image)
            throw new common_1.NotFoundException(`Không tìm thấy ảnh #${id}`);
        return image;
    }
    async update(id, updateImageDto) {
        const image = await this.findOne(id);
        const updated = this.imageRepo.merge(image, updateImageDto);
        return this.imageRepo.save(updated);
    }
    async remove(id) {
        const image = await this.findOne(id);
        await this.imageRepo.remove(image);
    }
    async moveImage(id, folder) {
        const image = await this.imageRepo.findOneBy({ id });
        if (!image)
            throw new common_1.NotFoundException('Không tìm thấy hình ảnh');
        image.folder = folder;
        return this.imageRepo.save(image);
    }
    async deleteFolder(path) {
        const images = await this.imageRepo
            .createQueryBuilder('image')
            .where('image.folder LIKE :path', { path: `${path}%` })
            .getMany();
        let deletedFromCloudinary = 0;
        for (const img of images) {
            const match = img.url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
            const publicId = match ? match[1] : null;
            if (publicId) {
                try {
                    await cloudinary_1.v2.uploader.destroy(publicId);
                    deletedFromCloudinary++;
                }
                catch (e) {
                }
            }
            await this.imageRepo.delete(img.id);
        }
        return { deleted: images.length, deletedFromCloudinary };
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(image_entity_1.Image)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ImagesService);
//# sourceMappingURL=images.service.js.map