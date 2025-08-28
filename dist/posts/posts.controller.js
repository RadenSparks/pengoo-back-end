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
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const posts_service_1 = require("./posts.service");
const create_post_dto_1 = require("./dto/create-post.dto");
const update_post_dto_1 = require("./dto/update-post.dto");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../auth/public.decorator");
let PostsController = class PostsController {
    postsService;
    constructor(postsService) {
        this.postsService = postsService;
    }
    async create(dto) {
        return this.postsService.create(dto);
    }
    async findAll() {
        return this.postsService.findAll();
    }
    async findOne(id) {
        return this.postsService.findOne(+id);
    }
    async findByCanonical(canonical) {
        return this.postsService.findByCanonical(canonical);
    }
    async update(id, dto) {
        return this.postsService.update(+id, dto);
    }
    async remove(id) {
        await this.postsService.remove(+id);
        return { message: 'Post deleted' };
    }
    async getPostBySlug(slug) {
        const post = await this.postsService.findBySlugOrId(slug);
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return post;
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new post' }),
    (0, swagger_1.ApiBody)({
        type: create_post_dto_1.CreatePostDto,
        examples: {
            default: {
                summary: 'Create post',
                value: {
                    name: 'How to Choose the Best Board Game',
                    canonical: 'how-to-choose-the-best-board-game',
                    description: 'Tips for choosing board games.',
                    content: 'Choosing the right board game can be tough...',
                    meta_description: 'Board game tips',
                    meta_keyword: 'boardgame, tips',
                    meta_title: 'How to Choose the Best Board Game',
                    image: 'https://example.com/image.jpg',
                    order: 1,
                    publish: true,
                    catalogueId: 1,
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_dto_1.CreatePostDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all posts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get post by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, example: 1 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('slug/:canonical'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get post by canonical (slug)' }),
    (0, swagger_1.ApiParam)({ name: 'canonical', type: String, example: 'how-to-choose-the-best-board-game' }),
    __param(0, (0, common_1.Param)('canonical')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findByCanonical", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a post' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, example: 1 }),
    (0, swagger_1.ApiBody)({
        type: update_post_dto_1.UpdatePostDto,
        examples: {
            default: {
                summary: 'Update post',
                value: {
                    name: 'Updated Title',
                    content: 'Updated content...',
                    order: 2,
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_post_dto_1.UpdatePostDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a post' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, example: 1 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getPostBySlug", null);
exports.PostsController = PostsController = __decorate([
    (0, swagger_1.ApiTags)('Posts'),
    (0, common_1.Controller)('posts'),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], PostsController);
//# sourceMappingURL=posts.controller.js.map