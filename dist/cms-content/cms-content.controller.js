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
exports.CmsContentController = void 0;
const common_1 = require("@nestjs/common");
const cms_content_service_1 = require("./cms-content.service");
const create_cms_content_dto_1 = require("./dto/create-cms-content.dto");
const update_cms_content_dto_1 = require("./dto/update-cms-content.dto");
let CmsContentController = class CmsContentController {
    cmsService;
    constructor(cmsService) {
        this.cmsService = cmsService;
    }
    async getCmsContent(productId) {
        const cms = await this.cmsService.findByProduct(productId);
        if (!cms)
            throw new common_1.NotFoundException('Không tìm thấy nội dung CMS');
        return cms;
    }
    async createCmsContent(productId, dto) {
        return this.cmsService.create(productId, dto);
    }
    async updateCmsContent(productId, dto) {
        return this.cmsService.update(productId, dto);
    }
};
exports.CmsContentController = CmsContentController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CmsContentController.prototype, "getCmsContent", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_cms_content_dto_1.CreateCmsContentDto]),
    __metadata("design:returntype", Promise)
], CmsContentController.prototype, "createCmsContent", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_cms_content_dto_1.UpdateCmsContentDto]),
    __metadata("design:returntype", Promise)
], CmsContentController.prototype, "updateCmsContent", null);
exports.CmsContentController = CmsContentController = __decorate([
    (0, common_1.Controller)('products/:productId/cms-content'),
    __metadata("design:paramtypes", [cms_content_service_1.CmsContentService])
], CmsContentController);
//# sourceMappingURL=cms-content.controller.js.map