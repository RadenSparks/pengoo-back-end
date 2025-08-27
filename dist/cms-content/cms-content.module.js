"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsContentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cms_content_entity_1 = require("./cms-content.entity");
const product_entity_1 = require("../products/entities/product.entity");
const cms_content_service_1 = require("./cms-content.service");
const cms_content_controller_1 = require("./cms-content.controller");
let CmsContentModule = class CmsContentModule {
};
exports.CmsContentModule = CmsContentModule;
exports.CmsContentModule = CmsContentModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([cms_content_entity_1.CmsContent, product_entity_1.Product])],
        providers: [cms_content_service_1.CmsContentService],
        controllers: [cms_content_controller_1.CmsContentController],
        exports: [cms_content_service_1.CmsContentService],
    })
], CmsContentModule);
//# sourceMappingURL=cms-content.module.js.map