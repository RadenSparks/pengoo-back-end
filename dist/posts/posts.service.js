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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const posts_entity_1 = require("./posts.entity");
const post_catalogue_entity_1 = require("./post-catalogue.entity");
function sanitizeCanonical(value) {
    return value
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9\-]/g, "")
        .toLowerCase();
}
let PostsService = class PostsService {
    postsRepository;
    cataloguesRepository;
    constructor(postsRepository, cataloguesRepository) {
        this.postsRepository = postsRepository;
        this.cataloguesRepository = cataloguesRepository;
    }
    async adjustOrdersOnCreateOrUpdate(catalogueId, newOrder, postIdToSkip) {
        const posts = await this.postsRepository.find({
            where: { catalogue: { id: catalogueId } },
            order: { order: "ASC" },
        });
        const filteredPosts = postIdToSkip
            ? posts.filter(p => p.id !== postIdToSkip)
            : posts;
        filteredPosts.splice(newOrder - 1, 0, null);
        let order = 1;
        for (const post of filteredPosts) {
            if (!post) {
                order++;
                continue;
            }
            if (post.order !== order) {
                post.order = order;
                await this.postsRepository.save(post);
            }
            order++;
        }
    }
    async create(dto) {
        const catalogue = await this.cataloguesRepository.findOne({ where: { id: dto.catalogueId } });
        if (!catalogue) {
            throw new Error('Catalogue not found');
        }
        if (dto.canonical) {
            dto.canonical = sanitizeCanonical(dto.canonical);
        }
        await this.adjustOrdersOnCreateOrUpdate(dto.catalogueId, dto.order ?? 1);
        const post = this.postsRepository.create({
            ...dto,
            catalogue,
        });
        return this.postsRepository.save(post);
    }
    async findAll() {
        return this.postsRepository.find({ relations: ['catalogue'] });
    }
    async findOne(id) {
        const post = await this.postsRepository.findOne({ where: { id }, relations: ['catalogue'] });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return post;
    }
    async update(id, dto) {
        const post = await this.findOne(id);
        if (dto.catalogueId) {
            const catalogue = await this.cataloguesRepository.findOne({ where: { id: dto.catalogueId } });
            if (!catalogue)
                throw new common_1.NotFoundException('Catalogue not found');
            post.catalogue = catalogue;
        }
        if (dto.canonical) {
            dto.canonical = sanitizeCanonical(dto.canonical);
        }
        const catalogueId = dto.catalogueId ?? post.catalogue.id;
        const newOrder = dto.order ?? post.order ?? 1;
        await this.adjustOrdersOnCreateOrUpdate(catalogueId, newOrder, id);
        Object.assign(post, dto);
        return this.postsRepository.save(post);
    }
    async remove(id) {
        const post = await this.findOne(id);
        await this.postsRepository.remove(post);
    }
    async findByCanonical(canonical) {
        return this.postsRepository.findOne({
            where: { canonical },
            relations: ['catalogue'],
        });
    }
    async findBySlugOrId(slugOrId) {
        let post = await this.postsRepository.findOne({ where: { canonical: slugOrId } });
        if (!post && !isNaN(Number(slugOrId))) {
            post = await this.postsRepository.findOne({ where: { id: Number(slugOrId) } });
        }
        return post ?? undefined;
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(posts_entity_1.Post)),
    __param(1, (0, typeorm_1.InjectRepository)(post_catalogue_entity_1.PostCatalogue)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PostsService);
//# sourceMappingURL=posts.service.js.map