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
exports.PublishersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const publisher_entity_1 = require("./entities/publisher.entity");
let PublishersService = class PublishersService {
    publishersRepo;
    constructor(publishersRepo) {
        this.publishersRepo = publishersRepo;
    }
    async create(createPublisherDto) {
        const publisher = this.publishersRepo.create(createPublisherDto);
        return await this.publishersRepo.save(publisher);
    }
    async findAll() {
        const publishers = await this.publishersRepo.find({
            relations: [
                'products',
                'products.tags',
                'products.images',
                'products.category_ID',
                'products.publisher_ID'
            ]
        });
        return publishers.map(pub => ({
            ...pub,
            products: pub.products.map(p => ({
                ...p,
                publisherID: p.publisher_ID
                    ? { id: p.publisher_ID.id, name: p.publisher_ID.name }
                    : null,
            })),
        }));
    }
    async findOne(id) {
        const publisher = await this.publishersRepo.findOne({
            where: { id },
            relations: [
                'products',
                'products.tags',
                'products.images',
                'products.category_ID',
                'products.publisher_ID'
            ]
        });
        if (!publisher)
            throw new common_1.NotFoundException('Không tìm thấy nhà xuất bản');
        return {
            ...publisher,
            products: publisher.products.map(p => ({
                ...p,
                publisherID: p.publisher_ID
                    ? { id: p.publisher_ID.id, name: p.publisher_ID.name }
                    : null,
            })),
        };
    }
    async update(id, updateDto) {
        const publisher = await this.findOne(id);
        Object.assign(publisher, updateDto);
        return await this.publishersRepo.save(publisher);
    }
    async remove(id) {
        await this.publishersRepo.softDelete(id);
        return { deleted: true };
    }
    async restore(id) {
        await this.publishersRepo.restore(id);
        return { restored: true };
    }
};
exports.PublishersService = PublishersService;
exports.PublishersService = PublishersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(publisher_entity_1.Publisher)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PublishersService);
//# sourceMappingURL=publishers.service.js.map